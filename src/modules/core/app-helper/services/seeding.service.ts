import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';
import {
  Identity,
  IdentityDocument,
} from '../../../app/auth-base/identities/entities/identity.entity';
import {
  Organization,
  OrganizationDocument,
} from '../../../app/organization/entities/organization.entity';
import { Role, RoleDocument } from '../../../app/roles/entities/role.entity';
import {
  Permission,
  PermissionDocument,
} from '../../../app/roles/entities/permission.entity';
import { IdentityStatus } from '../../../app/auth-base/identities/enums/identity-status.enum';
import { UserType } from '../../../app/auth-base/auth/enums/user-type.enum';
import { SubscriptionTiers } from '../../../app/api-keys/enums/subscription-tiers.enum';
import { Transactional } from 'src/common/decorators/transactional.decorator';
import { RolePermissionService } from '../../../app/roles/services/role-permission.service';
import { PermissionsService } from '../../../app/roles/services/permissions.service';

/**
 * Seeding Service
 *
 * Initializes the database with default data:
 * - Generates all system permissions
 * - Creates a super admin user
 * - Creates a super admin role
 * - Assigns all system permissions to super admin role
 * - Associates the role with the super admin user
 *
 * Configuration from environment variables:
 * - SUPER_ADMIN_EMAIL
 * - SUPER_ADMIN_PASSWORD
 */
@Injectable()
export class SeedingService implements OnModuleInit {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(Identity)
    private readonly identityRepository: BaseRepository<IdentityDocument>,
    @InjectRepository(Organization)
    private readonly organizationRepository: BaseRepository<OrganizationDocument>,
    @InjectRepository(Role)
    private readonly roleRepository: BaseRepository<RoleDocument>,
    @InjectRepository(Permission)
    private readonly permissionRepository: BaseRepository<PermissionDocument>,
    private readonly rolePermissionService: RolePermissionService,
    private readonly permissionsService: PermissionsService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.seedDatabase();
    } catch (error) {
      this.logger.error('Error seeding database:', error);
    }
  }

  /**
   * Main seeding function
   * Generates system permissions and creates/updates super admin with all system permissions
   * If super admin exists but new permissions were added, they will be assigned to the super admin role
   */
  @Transactional()
  private async seedDatabase(): Promise<void> {
    const superAdminEmail = this.configService.get<string>('SUPER_ADMIN_EMAIL');
    const superAdminPassword = this.configService.get<string>(
      'SUPER_ADMIN_PASSWORD',
    );

    if (!superAdminEmail || !superAdminPassword) {
      this.logger.warn(
        'Super admin credentials not configured. Skipping seeding.',
      );
      return;
    }

    this.logger.log('Starting database seeding...');

    try {
      // 0. Generate system permissions
      await this.permissionsService.generatePermissions();
      this.logger.log('✓ System permissions generated');

      // Check if super admin already exists
      const existingSuperAdmin = await this.identityRepository.model.findOne({
        email: superAdminEmail,
        isSuperAdmin: true,
      });

      if (existingSuperAdmin) {
        // Super admin exists - update their role with any new permissions
        this.logger.log(
          'Super admin user already exists. Updating with new permissions...',
        );
        await this.updateSuperAdminPermissions(existingSuperAdmin);
        this.logger.log('✓ Super admin permissions updated');
        this.logger.log('🎉 Database seeding completed successfully!');
        return;
      }

      // Create new super admin
      this.logger.log('Creating new super admin...');

      // 1. Create super admin identity
      const identity = await this.createSuperAdminIdentity(
        superAdminEmail,
        superAdminPassword,
      );

      // 2. Create super admin organization
      const organization = await this.createSuperAdminOrganization(identity);

      // 3. Create super admin role
      const superAdminRole = await this.createSuperAdminRole(organization);

      // 4. Assign system permissions to super admin role (excluding organization-specific permissions)
      const permissions = await this.permissionRepository.model
        .find({ organization: { $exists: false } })
        .exec();
      await this.assignPermissionsToRole(superAdminRole._id, permissions);
      this.logger.log(
        `✓ Assigned ${permissions.length} system permissions to super admin role`,
      );

      // 5. Assign super admin role to identity
      identity.role = superAdminRole._id as any;
      await identity.save();

      this.logger.log('✓ Super admin user created');

      this.logger.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Failed to seed database:', error);
      throw error;
    }
  }

  /**
   * Update super admin role with new system permissions
   * Finds all system permissions and assigns any new ones not already assigned
   */
  private async updateSuperAdminPermissions(
    superAdmin: IdentityDocument,
  ): Promise<void> {
    // Get the super admin's role
    const superAdminRole = await this.roleRepository.findOne({
      _id: superAdmin.role,
      isSuperAdmin: true,
    });

    if (!superAdminRole) {
      this.logger.warn(
        'Super admin role not found. Skipping permission update.',
      );
      return;
    }

    // Get all current system permissions (excluding organization-specific)
    const systemPermissions = await this.permissionRepository.model
      .find({ organization: { $exists: false } })
      .exec();

    // Get current permissions assigned to the super admin role
    const assignedPermissions =
      await this.rolePermissionService.getPermissionsForRole(
        superAdminRole._id.toString(),
      );

    // Find new permissions that aren't assigned yet
    // Filter out null permissions (in case permission was deleted but RolePermission reference exists)
    const assignedPermissionIds = new Set(
      assignedPermissions
        .filter(
          (rp: any) => rp.permission !== null && rp.permission !== undefined,
        )
        .map((rp: any) => rp.permission._id.toString()),
    );

    const newPermissionIds = systemPermissions
      .filter((p) => !assignedPermissionIds.has(p._id.toString()))
      .map((p) => p._id.toString());

    if (newPermissionIds.length > 0) {
      // Assign new permissions to super admin role
      await this.assignPermissionsToRole(superAdminRole._id, newPermissionIds);
      this.logger.log(
        `✓ Assigned ${newPermissionIds.length} new system permissions to super admin role`,
      );
    } else {
      this.logger.log('No new permissions to assign to super admin role');
    }
  }

  /**
   * Create super admin identity
   */
  private async createSuperAdminIdentity(
    email: string,
    password: string,
  ): Promise<IdentityDocument> {
    const identity = await this.identityRepository.createOne({
      email,
      password,
      status: IdentityStatus.ACTIVE,
      type: UserType.ORGANIZATION,
      isSuperAdmin: true,
      isVerified: true,
      dataCompleted: true,
    });

    return identity;
  }

  /**
   * Create super admin organization
   */
  private async createSuperAdminOrganization(
    identity: IdentityDocument,
  ): Promise<OrganizationDocument> {
    const organization = await this.organizationRepository.createOne({
      identity: identity._id as any,
      name: 'Super Admin Organization',
      subscriptionTier: SubscriptionTiers.ENTERPRISE,
    });

    return organization;
  }

  /**
   * Create super admin role
   */
  private async createSuperAdminRole(
    organization: OrganizationDocument,
  ): Promise<RoleDocument> {
    const superAdminRole = await this.roleRepository.createOne({
      name: {
        ar: 'مسؤول النظام',
        en: 'Super Admin',
      },
      organization: organization._id as any,
      isSuperAdmin: true,
    });

    return superAdminRole;
  }

  /**
   * Assign permissions to a role via RolePermissionService
   * Creates proper many-to-many relationships in RolePermission table
   * Accepts either permission documents or permission ID strings
   */
  private async assignPermissionsToRole(
    roleId: any,
    permissions: PermissionDocument[] | string[],
  ): Promise<void> {
    let permissionIds: string[];

    if (permissions.length === 0) {
      return;
    }

    // Check if input is PermissionDocument[] or string[]
    if (typeof permissions[0] === 'string') {
      permissionIds = permissions as string[];
    } else {
      permissionIds = (permissions as PermissionDocument[]).map((p) =>
        p._id.toString(),
      );
    }

    // Use RolePermissionService to create many-to-many relationships
    await this.rolePermissionService.assignPermissionsToRole(
      roleId.toString(),
      permissionIds,
      'system', // assignedBy
    );
  }
}
 