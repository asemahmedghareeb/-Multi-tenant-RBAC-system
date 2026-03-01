import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { getRegisteredPermissionEntities } from 'src/common/decorators/generate-permissions.decorator';
import { Permission, PermissionDocument } from '../entities/permission.entity';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { CheckUserHasPermissionDto } from '../dto/check-user-has-permission.dto';
import { Transactional } from 'src/common/decorators/transactional.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ErrorMessageEnum } from 'src/common/enums/error-message.enum';
import { IdentityStatus } from '../../auth-base/identities/enums/identity-status.enum';
import { User, UserDocument } from '../../users/entities/user.entity';
import { ReturnObject } from 'src/common/return-object/return-object';

@Injectable()
export class PermissionsService implements OnModuleInit {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: BaseRepository<PermissionDocument>,
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<UserDocument>,
    private readonly returnObject: ReturnObject,
  ) {}

  async onModuleInit() {
    await this.generatePermissions();
    this.logger.log('Permission generation completed');
  }

  @Transactional()
  async generatePermissions(): Promise<void> {
    const permissionsToCreate: Array<{ resource: string; action: string }> = [];

    // Get all entities dynamically from the registry
    const registeredEntities = getRegisteredPermissionEntities();

    for (const { entity, permissionEnum } of registeredEntities) {
      const entityName = entity.name;

      // Convert entity name to lowercase resource name (e.g., User -> user)
      const resourceName = entityName.toLowerCase();

      // Generate permissions for each action in the enum
      for (const action of Object.values(permissionEnum)) {
        permissionsToCreate.push({
          resource: resourceName,
          action: action,
        });
      }
    }

    // Get all existing permissions from database
    // const existingPermissions = await this.permissionModel.find().exec();
    const existingPermissions = await this.permissionRepository.model
      .find()
      .exec();

    // Create a Set of current valid permission keys for quick lookup
    const validPermissionKeys = new Set(
      permissionsToCreate.map((p) => `${p.resource}:${p.action}`),
    );

    // Find permissions to delete (exist in DB but not in current entities)
    // Skip permissions that belong to an organization (have an organization id)
    const permissionsToDelete = existingPermissions.filter(
      (p) =>
        !validPermissionKeys.has(`${p.resource}:${p.action}`) &&
        !(p as any).organization,
    );

    // Delete obsolete permissions
    if (permissionsToDelete.length > 0) {
      const deleteIds = permissionsToDelete.map((p) => (p as any)._id);
      await this.permissionRepository.deleteMany({ _id: { $in: deleteIds } });

      this.logger.warn(
        `Removed ${permissionsToDelete.length} obsolete permissions:`,
      );
    } else {
      this.logger.log('No obsolete permissions found');
    }

    // Bulk insert/update permissions using a single database operation
    if (permissionsToCreate.length > 0) {
      const bulkOps = permissionsToCreate.map((permission) => {
        const permissionName = `${permission.resource}:${permission.action}`;
        return {
          updateOne: {
            filter: {
              resource: permission.resource,
              action: permission.action,
            },
            update: {
              $setOnInsert: {
                resource: permission.resource,
                action: permission.action,
                arName: permissionName,
                enName: permissionName,
              },
            },
            upsert: true,
          },
        };
      });

      const result = await this.permissionRepository.model.bulkWrite(bulkOps);

      this.logger.log(
        `Permissions created: ${result.upsertedCount}, already existed: ${permissionsToCreate.length - result.upsertedCount}`,
      );
    }

    this.logger.log(
      `Total permissions processed: ${permissionsToCreate.length}`,
    );
  }

  @Transactional()
  async createPermission(
    createPermissionDto: CreatePermissionDto,
    identity: any,
  ) {
    const permission = await this.permissionRepository.createOne({
      ...(createPermissionDto as any),
      organization: identity.organization._id,
    });

    return permission;
  }

  async findAll(PaginationDto: PaginationDto, identity: any) {
    return await this.permissionRepository.findPaginated(
      { organization: identity.organization._id },
      { createdAt: -1 },
      PaginationDto.page,
      PaginationDto.limit,
      {},
      this.returnObject.permission,
    );
  }

  async findOne(id: string, identity: any) {
    return await this.permissionRepository.findOneOrFail(
      {
        _id: id,
        organization: identity.organization._id,
      },
      ErrorMessageEnum.FORBIDDEN,
    );
  }
z
  async delete(id: string, identity: any) {
    await this.permissionRepository.findOneOrFail(
      {
        _id: id,
        organization: identity.organization._id,
      },
      ErrorMessageEnum.FORBIDDEN,
    );

    return this.permissionRepository.deleteOneOrFail({ _id: id });
  }

  async checkUserHasPermission(dto: CheckUserHasPermissionDto, identity: any) {
    const userDoc: any = await this.userRepository.findOneOrFail(
      {
        _id: dto.userId,
        organization: identity.organization._id,
      },
      ErrorMessageEnum.FORBIDDEN,
      {
        populate: [
          {
            path: 'role',
            populate: {
              path: 'permissions',
            },
          },
        ],
      },
    );

    if (userDoc.isBlocked === true) {
      return false;
    }

    const hasPermission =
      userDoc.role?.permissions.some(
        (p: any) => p._id.toString() === dto.permissionId,
      ) || false;

    return hasPermission;
  }
}
