import { Injectable } from '@nestjs/common';
import { ApiKey } from 'src/modules/app/api-keys/entities/api-key.entity';
import { Identity } from 'src/modules/app/auth-base/identities/entities/identity.entity';
import { Organization } from 'src/modules/app/organization/entities/organization.entity';
import { Permission } from 'src/modules/app/roles/entities/permission.entity';
import { Role } from 'src/modules/app/roles/entities/role.entity';
import { User } from 'src/modules/app/users/entities/user.entity';

@Injectable()
export class ReturnObject {
  constructor() {}

  /**
   * Returns a clean user object with sensitive fields removed
   */
  user = (user: User) => {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  };

  /**
   * Returns a clean user with organization info
   */
  userWithOrganization = (user: User, organization: any) => {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      organization: this.organization(organization),
      createdAt: user.createdAt,
    };
  };

  /**
   * Returns identity object with safe fields
   */
  identity = (identity: Identity) => {
    return {
      id: identity._id,
      email: identity.email,
      type: identity.type,
      isVerified: identity.isVerified,
      status: identity.status,
      isSuperAdmin: identity.isSuperAdmin || false,
      createdAt: identity.createdAt,
    };
  };

  /**
   * Returns full identity with role and user details
   */
  identityWithRole = (identity: Identity) => {
    return {
      id: identity._id,
      email: identity.email,
      type: identity.type,
      isVerified: identity.isVerified,
      status: identity.status,
      isSuperAdmin: identity.isSuperAdmin || false,
      role: identity.role ? this.role(identity.role) : null,
      createdAt: identity.createdAt,
    };
  };

  /**
   * Returns role object with permissions
   */
  role = (role: Role) => {
    return {
      id: role._id,
      name: role.name,
      isSuperAdmin: role.isSuperAdmin || false,
      permissions: Array.isArray(role.permissions)
        ? role.permissions.map((permission: any) => this.permission(permission))
        : [],
      createdAt: role.createdAt,
    };
  };

  /**
   * Returns role without populated permissions to reduce payload
   */
  roleBasic = (role: Role) => {
    return {
      id: role._id,
      name: role.name,
      isSuperAdmin: role.isSuperAdmin || false,
      createdAt: role.createdAt,
    };
  };

  /**
   * Returns permission object
   */
  permission = (permission: Permission) => {
    return {
      id: permission._id,
      resource: permission.resource,
      action: permission.action,
      arName: permission.arName,
      enName: permission.enName,
      createdAt: permission.createdAt,
    };
  };

  /**
   * Returns organization object
   */
  organization = (organization: Organization) => {
    return {
      id: organization._id,
      name: organization.name,
      subscriptionTier: organization.subscriptionTier,
      createdAt: organization.createdAt,
    };
  };

  /**
   * Returns organization with API keys count
   */
  organizationWithStats = (
    organization: Organization,
    apiKeyCount?: number,
  ) => {
    return {
      id: organization._id,
      name: organization.name,
      subscriptionTier: organization.subscriptionTier,
      apiKeyCount: apiKeyCount || 0,
      createdAt: organization.createdAt,
    };
  };

  /**
   * Returns API key object (without exposing full key)
   */
  apiKey = (apiKey: ApiKey, includeFullKey: boolean = false) => {
    const response: any = {
      id: apiKey._id,
      key: includeFullKey ? apiKey.key : this.maskApiKey(apiKey.key),
      usageCount: apiKey.usageCount,
      tier: apiKey.tier,
      createdAt: apiKey.createdAt,
    };
    return response;
  };

  /**
   * Returns full API key details (should only be returned once after creation)
   */
  apiKeyFull = (apiKey: ApiKey) => {
    return {
      id: apiKey._id,
      key: apiKey.key,
      usageCount: apiKey.usageCount,
      tier: apiKey.tier,
      createdAt: apiKey.createdAt,
      message:
        'Please save this API key securely. You will not be able to see it again.',
    };
  };

  /**
   * Returns API key list (masked)
   */
  apiKeyList = (apiKeys: ApiKey[]) => {
    return apiKeys.map((apiKey) => this.apiKey(apiKey, false));
  };

  /**
   * Masks API key for security (shows first 8 and last 4 characters)
   */
  private maskApiKey = (key: string): string => {
    if (!key || key.length < 12) return '***';
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };

  /**
   * Returns paginated response format
   */
  paginated = (items: any[], pageInfo: any) => {
    return {
      data: items,
      pagination: pageInfo,
    };
  };
}
