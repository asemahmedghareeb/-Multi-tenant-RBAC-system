import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService, TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthMetadata } from 'src/common/types/auth-metadata.type';
import {
  ApiKey,
  ApiKeyDocument,
} from '../../../api-keys/entities/api-key.entity';
import { TIER_LIMITS } from '../../../api-keys/enums/subscription-limits.enum';
import { SubscriptionTiers } from '../../../api-keys/enums/subscription-tiers.enum';
import {
  Identity,
  IdentityDocument,
} from '../../identities/entities/identity.entity';
import { Organization } from '../../../organization/entities/organization.entity';
import { Permission } from '../../../roles/entities/permission.entity';
import { Role } from '../../../roles/entities/role.entity';
import {
  UserToken,
  UserTokenDocument,
} from '../../user-tokens/entities/user-token.entity';
import { AUTH_METADATA_KEY } from '../decorators/auth.decorator';
import { UserType } from '../enums/user-type.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @InjectRepository(Identity)
    private readonly identityRepository: BaseRepository<IdentityDocument>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: BaseRepository<ApiKeyDocument>,
    @InjectRepository(UserToken)
    private readonly userTokenRepository: BaseRepository<UserTokenDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authMetadata = this.reflector.get<AuthMetadata>(
      AUTH_METADATA_KEY,
      context.getHandler(),
    );

    let identity: any;

    const useTokenValidation = authMetadata?.validateToken === true;

    if (useTokenValidation) {
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException('Authentication token is required');
      }
      identity = await this.validateToken(token);
    } else {
      const apiKey = this.extractApiKey(request);
      if (!apiKey) {
        throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);
      }
      identity = await this.validateApiKey(apiKey);
    }

    request.user = identity;

    if (!authMetadata) {
      return true;
    }

    if (identity.isSuperAdmin) {
      return true;
    }

    if (authMetadata.roles && authMetadata.roles.length > 0) {
      const hasRole = await this.checkRoles(identity, authMetadata.roles);
      if (!hasRole) {
        throw new ForbiddenException(
          `Requires one of the following roles: ${authMetadata.roles.join(', ')}`,
        );
      }
    }

    if (
      authMetadata.permissions &&
      authMetadata.permissions.length > 0 &&
      identity.UserType !== UserType.ORGANIZATION
    ) {
      const hasPermissions = await this.checkPermissions(
        identity,
        authMetadata.permissions,
      );
      if (!hasPermissions) {
        throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
      }
    }

    return true;
  }

  private async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const tokenExists = await this.userTokenRepository.model.find({ token });
      if (!tokenExists) {
        throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);
      }
      const identity = await this.identityRepository.model
        .findById(payload.id)
        .populate([
          { path: 'organization' },
          {
            path: 'role',
            populate: {
              path: 'permissions',
            },
          },
        ])
        .select('-password -__v')
        .exec();

      if (!identity) {
        throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);
      }

      if (!identity.isVerified) {
        throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
      }

      if (identity.status !== 'ACTIVE') {
        throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
      }

      return identity;
    } catch (error) {
      console.error('Unknown token validation error:', error);
      throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);
    }
  }

  private async validateApiKey(Key: string): Promise<any> {
    try {
      const apiKey = await this.apiKeyRepository.model
        .findOne({ key: Key })
        .populate('organization')
        .exec();
      if (!apiKey) {
        throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);
      }

      switch (apiKey.tier) {
        case SubscriptionTiers.FREE:
          if (
            apiKey.usageCount >=
            TIER_LIMITS[SubscriptionTiers.FREE].requestsPerMonth
          ) {
            throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
          }

        case SubscriptionTiers.PRO:
          if (
            apiKey.usageCount >=
            TIER_LIMITS[SubscriptionTiers.PRO].requestsPerMonth
          ) {
            throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
          }
        case SubscriptionTiers.ENTERPRISE:
          if (
            apiKey.usageCount >=
            TIER_LIMITS[SubscriptionTiers.ENTERPRISE].requestsPerMonth
          ) {
            throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
          }
          break;
        default:
          throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);
      }

      apiKey.usageCount += 1;
      await apiKey.save();

      const identity = await this.identityRepository.model
        .findById((apiKey.organization as Organization).identity.toString())
        .populate([
          { path: 'organization' },
          {
            path: 'role',
            populate: { path: 'permissions' },
          },
        ])
        .exec();

      if (!identity) {
        throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);
      }

      if (identity.status !== 'ACTIVE') {
        throw new AppHttpException(ErrorCodeEnum.FORBIDDEN);
      }

      return identity;
    } catch (error) {
      throw new AppHttpException(ErrorCodeEnum.UNAUTHORIZED);
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ') ?? [];

    if (type !== 'Bearer') {
      console.warn(`Invalid auth type: ${type}, expected Bearer`);
      return undefined;
    }

    if (!token) {
      console.warn('Token is missing from Authorization header');
      return undefined;
    }

    return token;
  }

  private extractApiKey(request: any): string | undefined {
    return request.headers['x-api-key'];
  }

  /**
   * Check if user has any of the required roles
   */
  private async checkRoles(
    identity: any,
    requiredRoles: UserType[],
  ): Promise<boolean> {
    const identityType = identity.type;

    return requiredRoles.includes(identityType);
  }

  private async checkPermissions(
    identity: any,
    requiredPermissions: Array<{ target: string; action: string }>,
  ): Promise<boolean> {
    if (!identity.role) {
      return false;
    }

    const role = identity.role as Role;

    const userPermissions = (role.permissions || []) as Permission[];

    return requiredPermissions.every((required) => {
      return userPermissions.some(
        (userPerm) =>
          userPerm.resource === required.target &&
          userPerm.action === required.action,
      );
    });
  }
}
