import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Identity } from 'src/modules/identities/entities/identity.entity';
import { Permission } from 'src/modules/roles/entities/permission.entity';
import { Role } from 'src/modules/roles/entities/role.entity';
import { ApiKey } from 'src/modules/api-keys/entities/api-key.entity';
import { AuthMetadata } from '../../../common/types/auth-metadata.type';
import { AUTH_METADATA_KEY } from '../decorators/auth.decorator';
import { SubscriptionTiers } from 'src/modules/api-keys/enums/subscribtion-tiers.enum';
import { TIER_LIMITS } from 'src/modules/api-keys/enums/subscribtion-limits.enum';
import { Organization } from 'src/modules/organization/entities/organization.entity';
import { UserType } from 'src/modules/auth/enums/user-type.enum';
import { Transactional } from '../../../common/decorators/transactional.decorator';
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { UserToken } from 'src/modules/user-tokens/entities/user-token.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    @InjectModel(Identity.name) private readonly identityModel: Model<Identity>,
    @InjectModel(ApiKey.name) private readonly apiKeyModel: Model<ApiKey>,
    @InjectModel(UserToken.name)
    private readonly userTokenModel: Model<UserToken>,
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
        throw new UnauthorizedException('API key is required');
      }
      identity = await this.validateApiKey(apiKey);
    }

    request.user = identity;

    if (!authMetadata) {
      return true;
    }

    // Super admin bypass
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
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }

  private async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const tokenExists = await this.userTokenModel.findOne({ token });
      if (!tokenExists) {
        throw new UnauthorizedException('Invalid token');
      }
      const identity = await this.identityModel
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
        .exec();

      if (!identity) {
        throw new UnauthorizedException('Invalid token');
      }

      if (!identity.isVerified) {
        throw new UnauthorizedException('Account not verified');
      }

      if (identity.status !== 'ACTIVE') {
        throw new UnauthorizedException('Account is not active');
      }

      return identity;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.error('Token has expired:', error.expiredAt);
        throw new UnauthorizedException('Token has expired');
      }

      if (error instanceof JsonWebTokenError) {
        if (error.message === 'invalid signature') {
          console.error(
            'Invalid token signature - token was tampered with or signed with a different secret',
          );
          throw new UnauthorizedException('Invalid token signature');
        }
        console.error('JWT error:', error.message);
        throw new UnauthorizedException(error.message);
      }

      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      console.error('Unknown token validation error:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }

  private async validateApiKey(Key: string): Promise<any> {
    try {
      const apiKey = await this.apiKeyModel
        .findOne({ key: Key })
        .populate('organization')
        .exec();
      if (!apiKey) {
        throw new UnauthorizedException('Invalid API key');
      }

      switch (apiKey.tier) {
        case SubscriptionTiers.FREE:
          if (
            apiKey.usageCount >=
            TIER_LIMITS[SubscriptionTiers.FREE].requestsPerMonth
          ) {
            throw new ForbiddenException('API key request limit exceeded');
          }

        case SubscriptionTiers.PRO:
          if (
            apiKey.usageCount >=
            TIER_LIMITS[SubscriptionTiers.PRO].requestsPerMonth
          ) {
            throw new ForbiddenException('API key request limit exceeded');
          }
        case SubscriptionTiers.ENTERPRISE:
          if (
            apiKey.usageCount >=
            TIER_LIMITS[SubscriptionTiers.ENTERPRISE].requestsPerMonth
          ) {
            throw new ForbiddenException('API key request limit exceeded');
          }
          break;
        default:
          throw new UnauthorizedException('Invalid subscription tier');
      }

      apiKey.usageCount += 1;
      await apiKey.save();

      const identity = await this.identityModel
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
        throw new UnauthorizedException('User not found');
      }

      if (identity.status !== 'ACTIVE') {
        throw new UnauthorizedException('User account is not active');
      }

      return identity;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new UnauthorizedException('API key validation failed');
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
