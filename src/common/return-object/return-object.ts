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

  user = (user: User) => {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };
  };

  userWithOrganization = (user: User, organization: any) => {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      organization: this.organization(organization),
      createdAt: user.createdAt,
    };
  };

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

  role = (role: Role) => {
    return {
      id: role._id,
      name: role.name,
      isSuperAdmin: role.isSuperAdmin || false,
      createdAt: role.createdAt,
    };
  };

  roleBasic = (role: Role) => {
    return {
      id: role._id,
      name: role.name,
      isSuperAdmin: role.isSuperAdmin || false,
      createdAt: role.createdAt,
    };
  };

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

  organization = (organization: Organization) => {
    return {
      id: organization._id,
      name: organization.name,
      subscriptionTier: organization.subscriptionTier,
      createdAt: organization.createdAt,
    };
  };

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

  apiKeyList = (apiKeys: ApiKey[]) => {
    return apiKeys.map((apiKey) => this.apiKey(apiKey, false));
  };

  private maskApiKey = (key: string): string => {
    if (!key || key.length < 12) return '***';
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };

  paginated = (items: any[], pageInfo: any) => {
    return {
      data: items,
      pagination: pageInfo,
    };
  };
}
