import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';
import {
  Identity,
  IdentityDocument,
} from 'src/modules/app/auth-base/identities/entities/identity.entity';
import { IdentityStatus } from 'src/modules/app/auth-base/identities/enums/identity-status.enum';
import { UserTokensService } from 'src/modules/app/auth-base/user-tokens/user-tokens.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userTokensService: UserTokensService,
    @InjectRepository(Identity)
    private readonly identityRepository: BaseRepository<IdentityDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractToken(client);

    if (!token) {
      client.emit('error', { message: 'Unauthorized: No token provided' });
      client.disconnect();
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);

      // Check if token exists in database
      const tokenExists =
        await this.userTokensService.verifyTokenInDatabase(token);

      if (!tokenExists) {
        client.emit('error', {
          message: 'Unauthorized: Token not found or invalid',
        });
        client.disconnect();
        return false;
      }
      await this.identityRepository.findOneOrFail({
        _id: payload.id,
        isVerified: true,
        status: IdentityStatus.ACTIVE,
      });

      client.data.user = payload;
      return true;
    } catch (error) {
      client.emit('error', { message: 'Unauthorized: Invalid token' });
      client.disconnect();
      return false;
    }
  }

  private extractToken(client: Socket): string | null {
    // Extract token from handshake auth header
    let token = client.handshake.auth?.token;

    // Try to extract from authorization header (case-insensitive)
    if (!token && client.handshake.headers?.authorization) {
      const authHeader = client.handshake.headers.authorization;
      if (authHeader.toLowerCase().startsWith('bearer ')) {
        token = authHeader.slice(7);
      } else {
        token = authHeader;
      }
    }

    return token || null;
  }
}
