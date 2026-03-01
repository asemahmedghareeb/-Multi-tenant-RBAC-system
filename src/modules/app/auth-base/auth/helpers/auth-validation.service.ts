import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorMessageEnum } from 'src/common/enums/error-message.enum';
import {
  Identity,
  IdentityDocument,
} from '../../identities/entities/identity.entity';
import {
  ApiKey,
  ApiKeyDocument,
} from '../../../api-keys/entities/api-key.entity';
import {
  UserToken,
  UserTokenDocument,
} from '../../user-tokens/entities/user-token.entity';
import { Organization } from '../../../organization/entities/organization.entity';
import { SubscriptionTiers } from '../../../api-keys/enums/subscription-tiers.enum';
import { TIER_LIMITS } from '../../../api-keys/enums/subscription-limits.enum';
import { Role } from '../../../roles/entities/role.entity';
import { Permission } from '../../../roles/entities/permission.entity';
import { UserType } from '../enums/user-type.enum';

@Injectable()
export class AuthValidationService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Identity)
    private readonly identityRepository: BaseRepository<IdentityDocument>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: BaseRepository<ApiKeyDocument>,
    @InjectRepository(UserToken)
    private readonly userTokenRepository: BaseRepository<UserTokenDocument>,
  ) {}

  extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ') ?? [];

    if (type !== 'Bearer') {
      console.warn(
        `[Auth Validation] Invalid auth type: ${type}. Expected 'Bearer' type in Authorization header`,
      );
      return undefined;
    }

    if (!token) {
      console.warn(
        '[Auth Validation] Token is missing from Authorization header. Please provide a token after the Bearer keyword',
      );
      return undefined;
    }

    return token;
  }

  extractApiKey(request: any): string | undefined {
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
      console.warn(
        '[Auth Validation] API key is missing from the x-api-key header',
      );
      return undefined;
    }
    return apiKey;
  }

  async validateToken(token: string): Promise<any> {
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch (error) {
      console.error('[Auth Validation] Token verification failed:', error);
      throw new AppHttpException(ErrorMessageEnum.TOKEN_VERIFICATION_FAILED);
    }

    const tokenExists = await this.userTokenRepository.model.findOne({
      token,
    });
    if (!tokenExists) {
      throw new AppHttpException(ErrorMessageEnum.TOKEN_NOT_FOUND_IN_SESSION);
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
      throw new AppHttpException(ErrorMessageEnum.USER_IDENTITY_NOT_FOUND);
    }

    if (!identity.isVerified) {
      throw new AppHttpException(ErrorMessageEnum.USER_EMAIL_NOT_VERIFIED);
    }

    if (identity.status !== 'ACTIVE') {
      throw new AppHttpException(ErrorMessageEnum.USER_ACCOUNT_INACTIVE);
    }

    return identity;
  }

  async validateApiKey(apiKeyString: string): Promise<any> {
    const apiKey = await this.apiKeyRepository.model
      .findOne({ key: apiKeyString })
      .populate('organization')
      .exec();
    if (!apiKey) {
      throw new AppHttpException(ErrorMessageEnum.INVALID_API_KEY);
    }

    // Check usage limits based on subscription tier
    this.checkApiKeyUsageLimit(apiKey);

    // Check if API key has expired
    if (this.isApiKeyExpired(apiKey.createdAt!)) {
      throw new AppHttpException(ErrorMessageEnum.API_KEY_EXPIRED);
    }

    // Increment usage counter and save
    apiKey.usageCount += 1;
    await apiKey.save();

    // Load organization's identity
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
      throw new AppHttpException(ErrorMessageEnum.USER_IDENTITY_NOT_FOUND);
    }

    if (identity.status !== 'ACTIVE') {
      throw new AppHttpException(ErrorMessageEnum.USER_ACCOUNT_INACTIVE);
    }

    return identity;
  }

  private checkApiKeyUsageLimit(apiKey: any): void {
    switch (apiKey.tier) {
      case SubscriptionTiers.FREE:
        if (
          apiKey.usageCount >=
          TIER_LIMITS[SubscriptionTiers.FREE].requestsPerMonth
        ) {
          throw new AppHttpException(
            ErrorMessageEnum.API_KEY_USAGE_LIMIT_EXCEEDED_FREE,
          );
        }
        break;
      case SubscriptionTiers.PRO:
        if (
          apiKey.usageCount >=
          TIER_LIMITS[SubscriptionTiers.PRO].requestsPerMonth
        ) {
          throw new AppHttpException(
            ErrorMessageEnum.API_KEY_USAGE_LIMIT_EXCEEDED_PRO,
          );
        }
        break;
      case SubscriptionTiers.ENTERPRISE:
        if (
          apiKey.usageCount >=
          TIER_LIMITS[SubscriptionTiers.ENTERPRISE].requestsPerMonth
        ) {
          throw new AppHttpException(
            ErrorMessageEnum.API_KEY_USAGE_LIMIT_EXCEEDED_ENTERPRISE,
          );
        }
        break;
    }
  }

  isApiKeyExpired(createdAt: Date): boolean {
    const now = new Date();
    const expirationDate = new Date(createdAt);
    expirationDate.setDate(expirationDate.getDate() + 30);

    const isExpired = now > expirationDate;
    if (isExpired) {
      console.warn(
        `[Auth Validation] API key expired on ${expirationDate.toISOString()}`,
      );
    }

    return isExpired;
  }

  async checkRoles(identity: any, requiredRoles: UserType[]): Promise<boolean> {
    const identityType = identity.type;
    const hasRequiredRole = requiredRoles.includes(identityType);

    if (!hasRequiredRole) {
      console.warn(
        `[Auth Validation] User with type '${identityType}' does not have required role(s): ${requiredRoles.join(', ')}`,
      );
    }

    return hasRequiredRole;
  }

  async checkPermissions(
    identity: any,
    requiredPermissions: Array<{ target: string; action: string }>,
  ): Promise<boolean> {
    if (!identity.role) {
      console.warn('[Auth Validation] User does not have an assigned role');
      return false;
    }

    const role = identity.role as Role;
    const userPermissions = (role.permissions || []) as Permission[];

    const hasAllPermissions = requiredPermissions.every((required) => {
      return userPermissions.some(
        (userPerm) =>
          userPerm.resource === required.target &&
          userPerm.action === required.action,
      );
    });

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter((required) => {
        return !userPermissions.some(
          (userPerm) =>
            userPerm.resource === required.target &&
            userPerm.action === required.action,
        );
      });
      console.warn(
        `[Auth Validation] User is missing required permissions: ${missingPermissions.map((p) => `${p.target}:${p.action}`).join(', ')}`,
      );
    }

    return hasAllPermissions;
  }
}
