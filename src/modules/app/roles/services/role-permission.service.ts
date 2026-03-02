import { Injectable } from '@nestjs/common';
import { RolePermission, RolePermissionDocument } from '../entities/role-permission.entity';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { Transactional } from 'src/common/decorators/transactional.decorator';
import { Logger } from '@nestjs/common';

/**
 * RolePermissionService
 *
 * Manages the many-to-many relationship between Role and Permission
 * Handles assignment, removal, and cascade delete operations
 */
@Injectable()
export class RolePermissionService {
  private readonly logger = new Logger(RolePermissionService.name);

  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: BaseRepository<RolePermissionDocument>,
  ) {}

  /**
   * Assign a permission to a role
   * Prevents duplicate assignments with unique index
   */
  @Transactional()
  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
    assignedBy?: string,
  ): Promise<RolePermissionDocument> {
    return await this.rolePermissionRepository.createOne({
      role: roleId as any,
      permission: permissionId as any,
      assignedBy,
      assignedAt: new Date(),
    });
  }

  /**
   * Assign multiple permissions to a role
   */
  @Transactional()
  async assignPermissionsToRole(
    roleId: string,
    permissionIds: string[],
    assignedBy?: string,
  ): Promise<RolePermissionDocument[]> {
    const operations = permissionIds.map((permissionId) => ({
      updateOne: {
        filter: { role: roleId, permission: permissionId },
        update: {
          $setOnInsert: {
            role: roleId,
            permission: permissionId,
            assignedBy,
            assignedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    if (operations.length === 0) {
      return [];
    }

    await this.rolePermissionRepository.model.bulkWrite(operations);

    // Fetch and return the created/updated records
    return await this.rolePermissionRepository.model
      .find({ role: roleId, permission: { $in: permissionIds } })
      .exec();
  }

  /**
   * Remove a permission from a role
   */
  @Transactional()
  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    await this.rolePermissionRepository.deleteMany({
      role: roleId,
      permission: permissionId,
    });
  }

  /**
   * Remove multiple permissions from a role
   */
  @Transactional()
  async removePermissionsFromRole(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    await this.rolePermissionRepository.deleteMany({
      role: roleId,
      permission: { $in: permissionIds },
    });
  }

  /**
   * Get all permissions for a specific role
   * This is called during auth validation
   */
  async getPermissionsForRole(roleId: string): Promise<RolePermissionDocument[]> {
    return await this.rolePermissionRepository.model
      .find({ role: roleId })
      .populate('permission')
      .exec();
  }

  /**
   * Get all roles that have a specific permission
   * Useful for permission-centric queries
   */
  async getRolesWithPermission(permissionId: string): Promise<RolePermissionDocument[]> {
    return await this.rolePermissionRepository.model
      .find({ permission: permissionId })
      .populate('role')
      .exec();
  }

  /**
   * CASCADE DELETE: Remove all role permissions when a permission is deleted
   * This is the critical method that ensures data integrity
   * Called by PermissionsService.deletePermission()
   */
  @Transactional()
  async cascadeDeleteByPermission(permissionId: string): Promise<number> {
    const result = await this.rolePermissionRepository.deleteMany({
      permission: permissionId,
    });

    const deletedCount = typeof result === 'number' ? result : (result as any)?.deletedCount || 0;
    if (deletedCount > 0) {
      this.logger.log(
        `Cascade deleted ${deletedCount} role-permission links for permission ${permissionId}`,
      );
    }

    return deletedCount;
  }

  /**
   * CASCADE DELETE: Remove all role permissions when a role is deleted
   */
  @Transactional()
  async cascadeDeleteByRole(roleId: string): Promise<number> {
    const result = await this.rolePermissionRepository.deleteMany({
      role: roleId,
    });

    const deletedCount = typeof result === 'number' ? result : (result as any)?.deletedCount || 0;
    if (deletedCount > 0) {
      this.logger.log(
        `Cascade deleted ${deletedCount} role-permission links for role ${roleId}`,
      );
    }

    return deletedCount;
  }

  /**
   * Clear all permissions for a role
   */
  @Transactional()
  async clearRolePermissions(roleId: string): Promise<number> {
    const result = await this.rolePermissionRepository.deleteMany({
      role: roleId,
    });

    return typeof result === 'number' ? result : (result as any)?.deletedCount || 0;
  }

  /**
   * Check if a role has a specific permission
   */
  async hasPermission(roleId: string, permissionId: string): Promise<boolean> {
    const record = await this.rolePermissionRepository.model.findOne({
      role: roleId,
      permission: permissionId,
    });

    return !!record;
  }

  /**
   * Get count of permissions for a role
   */
  async getPermissionCountForRole(roleId: string): Promise<number> {
    return await this.rolePermissionRepository.model.countDocuments({
      role: roleId,
    });
  }
}
