import { ExecutionContext, Injectable } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerRequest,
} from '@nestjs/throttler';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  // Connection-level rate limit tracking: socketId -> eventName -> RateLimitRecord
  private connectionLimits = new Map<string, Map<string, RateLimitRecord>>();

  // User-level (total) rate limit tracking: userId -> RateLimitRecord
  private userLimits = new Map<string, RateLimitRecord>();

  // Configuration
  private readonly config = {
    connection: { limit: 10, ttl: 1000 }, // 10 messages per second per connection
    user: { limit: 50, ttl: 1000 }, // 50 total messages per second per user
  };

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { context } = requestProps;

    const client = context.switchToWs().getClient();
    const userId = client.data?.user?.id || 'unknown';
    const socketId = client.id;
    const eventName = context.switchToWs().getPattern();

    const now = Date.now();

    // 1. Check Connection-level limit
    if (!this.connectionLimits.has(socketId)) {
      this.connectionLimits.set(socketId, new Map());
    }

    const connMap = this.connectionLimits.get(socketId)!;
    const connKey = eventName;

    let connRecord = connMap.get(connKey);
    if (!connRecord || now > connRecord.resetTime) {
      connRecord = { count: 0, resetTime: now + this.config.connection.ttl };
    }

    connRecord.count++;
    connMap.set(connKey, connRecord);

    if (connRecord.count > this.config.connection.limit) {
      client.emit('error', {
        message: 'Connection rate limit exceeded',
        type: 'CONNECTION_RATE_LIMIT',
      });
      throw new ThrottlerException('Connection rate limit exceeded');
    }

    // 2. Check User-level (total) limit
    let userRecord = this.userLimits.get(userId);
    if (!userRecord || now > userRecord.resetTime) {
      userRecord = { count: 0, resetTime: now + this.config.user.ttl };
    }

    userRecord.count++;
    this.userLimits.set(userId, userRecord);

    if (userRecord.count > this.config.user.limit) {
      client.emit('error', {
        message: 'Total rate limit exceeded',
        type: 'TOTAL_RATE_LIMIT',
      });
      throw new ThrottlerException('Total rate limit exceeded');
    }

    return true;
  }

  // Call this when a socket disconnects to clean up memory
  cleanupConnection(socketId: string, userId: string): void {
    this.connectionLimits.delete(socketId);
    // Optionally reset user limit when all connections close
    // You can extend this to track connection count per user
  }
}
