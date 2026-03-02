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
import { Role, RoleDocument } from '../../../app/auth-base/roles/entities/role.entity';
import {
  Permission,
  PermissionDocument,
} from '../../../app/auth-base/roles/entities/permission.entity';
import { IdentityStatus } from '../../../app/auth-base/identities/enums/identity-status.enum';
import { UserType } from '../../../app/auth-base/auth/enums/user-type.enum';
import { SubscriptionTiers } from '../../../app/api-keys/enums/subscription-tiers.enum';
import { Transactional } from 'src/common/decorators/transactional.decorator';
import { RolePermissionService } from '../../../app/auth-base/roles/services/role-permission.service';
import { PermissionsService } from '../../../app/auth-base/roles/services/permissions.service';

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
      await this.permissionsService.generatePermissions();
      this.logger.log('✓ System permissions generated');

      const existingSuperAdmin = await this.identityRepository.model.findOne({
        email: superAdminEmail,
        isSuperAdmin: true,
      });

      if (existingSuperAdmin) {
        this.logger.log(
          'Super admin user already exists. Updating with new permissions...',
        );
        await this.updateSuperAdminPermissions(existingSuperAdmin);
        this.logger.log('✓ Super admin permissions updated');
        this.logger.log('🎉 Database seeding completed successfully!');
        return;
      }

      this.logger.log('Creating new super admin...');

      const identity = await this.createSuperAdminIdentity(
        superAdminEmail,
        superAdminPassword,
      );

      const organization = await this.createSuperAdminOrganization(identity);

      const superAdminRole = await this.createSuperAdminRole(organization);

      const permissions = await this.permissionRepository.model
        .find({ organization: { $exists: false } })
        .exec();
      await this.assignPermissionsToRole(superAdminRole._id, permissions);

      identity.role = superAdminRole._id as any;
      await identity.save();

      this.logger.log('✓ Super admin user created');

      this.logger.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      this.logger.error('Failed to seed database:', error);
      throw error;
    }
  }

  private async updateSuperAdminPermissions(
    superAdmin: IdentityDocument,
  ): Promise<void> {
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

    const systemPermissions = await this.permissionRepository.model
      .find({ organization: { $exists: false } })
      .exec();

    const assignedPermissions =
      await this.rolePermissionService.getPermissionsForRole(
        superAdminRole._id.toString(),
      );

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
      await this.assignPermissionsToRole(superAdminRole._id, newPermissionIds);
      this.logger.log(
        `✓ Assigned ${newPermissionIds.length} new system permissions to super admin role`,
      );
    } else {
      this.logger.log('No new permissions to assign to super admin role');
    }
  }

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

  private async assignPermissionsToRole(
    roleId: any,
    permissions: PermissionDocument[] | string[],
  ): Promise<void> {
    let permissionIds: string[];

    if (permissions.length === 0) {
      return;
    }

    if (typeof permissions[0] === 'string') {
      permissionIds = permissions as string[];
    } else {
      permissionIds = (permissions as PermissionDocument[]).map((p) =>
        p._id.toString(),
      );
    }

    await this.rolePermissionService.assignPermissionsToRole(
      roleId.toString(),
      permissionIds,
      'system',
    );
  }
}
 