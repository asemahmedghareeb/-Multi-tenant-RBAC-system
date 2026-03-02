import { Injectable } from '@nestjs/common';
import { RolePermission, RolePermissionDocument } from '../entities/role-permission.entity';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { Transactional } from 'src/common/decorators/transactional.decorator';
import { Logger } from '@nestjs/common';

@Injectable()
export class RolePermissionService {
  private readonly logger = new Logger(RolePermissionService.name);

  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: BaseRepository<RolePermissionDocument>,
  ) {}

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

    return await this.rolePermissionRepository.model
      .find({ role: roleId, permission: { $in: permissionIds } })
      .exec();
  }

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

  async getPermissionsForRole(roleId: string): Promise<RolePermissionDocument[]> {
    return await this.rolePermissionRepository.model
      .find({ role: roleId })
      .populate('permission')
      .exec();
  }

  async getRolesWithPermission(permissionId: string): Promise<RolePermissionDocument[]> {
    return await this.rolePermissionRepository.model
      .find({ permission: permissionId })
      .populate('role')
      .exec();
  }

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

  @Transactional()
  async clearRolePermissions(roleId: string): Promise<number> {
    const result = await this.rolePermissionRepository.deleteMany({
      role: roleId,
    });

    return typeof result === 'number' ? result : (result as any)?.deletedCount || 0;
  }

  async hasPermission(roleId: string, permissionId: string): Promise<boolean> {
    const record = await this.rolePermissionRepository.model.findOne({
      role: roleId,
      permission: permissionId,
    });

    return !!record;
  }

  async getPermissionCountForRole(roleId: string): Promise<number> {
    return await this.rolePermissionRepository.model.countDocuments({
      role: roleId,
    });
  }
}
