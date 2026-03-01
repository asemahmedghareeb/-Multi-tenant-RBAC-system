import { Injectable } from '@nestjs/common';

@Injectable()
export class ReturnObject {
  constructor() {}

  /**
   * Returns a clean user object with sensitive fields removed
   */
  user(user: any, identity?: any) {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      // email: identity.email,
      // isVerified: identity.isVerified,
      // status: identity.status,
      // dataCompleted: identity.dataCompleted,
      createdAt: user.createdAt,
    };
  }

  /**
   * Returns a clean user with organization info
   */
  userWithOrganization(user: any, identity: any, organization: any) {
    return {
      id: user._id,
      username: user.username,
      email: identity.email,
      isVerified: identity.isVerified,
      status: identity.status,
      dataCompleted: identity.dataCompleted,
      organization: this.organization(organization),
      createdAt: user.createdAt,
    };
  }

  /**
   * Returns identity object with safe fields
   */
  identity(identity: any) {
    return {
      id: identity._id,
      email: identity.email,
      type: identity.type,
      isVerified: identity.isVerified,
      status: identity.status,
      isSuperAdmin: identity.isSuperAdmin || false,
      createdAt: identity.createdAt,
    };
  }

  /**
   * Returns full identity with role and user details
   */
  identityWithRole(identity: any) {
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
  }

  /**
   * Returns role object with permissions
   */
  role(role: any) {
    return {
      id: role._id,
      name: role.name,
      isSuperAdmin: role.isSuperAdmin || false,
      permissions: Array.isArray(role.permissions)
        ? role.permissions.map((permission: any) => this.permission(permission))
        : [],
      createdAt: role.createdAt,
    };
  }

  /**
   * Returns role without populated permissions to reduce payload
   */
  roleBasic(role: any) {
    return {
      id: role._id,
      name: role.name,
      isSuperAdmin: role.isSuperAdmin || false,
      createdAt: role.createdAt,
    };
  }

  /**
   * Returns permission object
   */
  permission(permission: any) {
    return {
      id: permission._id,
      resource: permission.resource,
      action: permission.action,
      arName: permission.arName,
      enName: permission.enName,
      createdAt: permission.createdAt,
    };
  }

  /**
   * Returns organization object
   */
  organization(organization: any) {
    return {
      id: organization._id,
      name: organization.name,
      subscriptionTier: organization.subscriptionTier,
      createdAt: organization.createdAt,
    };
  }

  /**
   * Returns organization with API keys count
   */
  organizationWithStats(organization: any, apiKeyCount?: number) {
    return {
      id: organization._id,
      name: organization.name,
      subscriptionTier: organization.subscriptionTier,
      apiKeyCount: apiKeyCount || 0,
      createdAt: organization.createdAt,
    };
  }

  /**
   * Returns API key object (without exposing full key)
   */
  apiKey(apiKey: any, includeFullKey: boolean = false) {
    const response: any = {
      id: apiKey._id,
      key: includeFullKey ? apiKey.key : this.maskApiKey(apiKey.key),
      usageCount: apiKey.usageCount,
      tier: apiKey.tier,
      createdAt: apiKey.createdAt,
    };
    return response;
  }

  /**
   * Returns full API key details (should only be returned once after creation)
   */
  apiKeyFull(apiKey: any) {
    return {
      id: apiKey._id,
      key: apiKey.key,
      usageCount: apiKey.usageCount,
      tier: apiKey.tier,
      createdAt: apiKey.createdAt,
      message:
        'Please save this API key securely. You will not be able to see it again.',
    };
  }

  /**
   * Returns API key list (masked)
   */
  apiKeyList(apiKeys: any[]) {
    return apiKeys.map((apiKey) => this.apiKey(apiKey, false));
  }

  /**
   * Masks API key for security (shows first 8 and last 4 characters)
   */
  private maskApiKey(key: string): string {
    if (!key || key.length < 12) return '***';
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  }

  /**
   * Returns paginated response format
   */
  paginated(items: any[], pageInfo: any) {
    return {
      data: items,
      pagination: pageInfo,
    };
  }
}
