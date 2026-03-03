import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

@Injectable()
export class WsMessageValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client: Socket = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    // Validate that data is not null/undefined
    if (data === null || data === undefined) {
      throw new BadRequestException('Message data is required');
    }

    // Validate that user is authenticated (has user data from JWT)
    if (!client.data.user) {
      client.emit('error', { message: 'Unauthorized' });
      throw new BadRequestException('User not authenticated');
    }

    return next.handle();
  }
}
