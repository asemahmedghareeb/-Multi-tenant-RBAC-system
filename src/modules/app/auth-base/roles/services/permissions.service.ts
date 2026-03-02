import { Injectable, Logger } from '@nestjs/common';
import { getRegisteredPermissionEntities } from 'src/common/decorators/generate-permissions.decorator';
import { Permission, PermissionDocument } from '../entities/permission.entity';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { CheckUserHasPermissionDto } from '../dto/check-user-has-permission.dto';
import { Transactional } from 'src/common/decorators/transactional.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ErrorMessageEnum } from 'src/common/enums/error-message.enum';
import { User, UserDocument } from '../../../users/entities/user.entity';
import { ReturnObject } from 'src/common/return-object/return-object';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { RolePermissionService } from './role-permission.service';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: BaseRepository<PermissionDocument>,
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<UserDocument>,
    private readonly returnObject: ReturnObject,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  @Transactional()
  async generatePermissions(): Promise<void> {
    const permissionsToCreate: Array<{ resource: string; action: string }> = [];

    const registeredEntities = getRegisteredPermissionEntities();

    for (const { entity, permissionEnum } of registeredEntities) {
      const entityName = entity.name;

      const resourceName = entityName.toLowerCase();

      for (const action of Object.values(permissionEnum)) {
        permissionsToCreate.push({
          resource: resourceName,
          action: action,
        });
      }
    }

    const existingPermissions = await this.permissionRepository.model
      .find()
      .exec();

    const validPermissionKeys = new Set(
      permissionsToCreate.map((p) => `${p.resource}:${p.action}`),
    );

    const permissionsToDelete = existingPermissions.filter(
      (p) =>
        !validPermissionKeys.has(`${p.resource}:${p.action}`) &&
        !(p as any).organization,
    );

    if (permissionsToDelete.length > 0) {
      const deleteIds = permissionsToDelete.map((p) => (p as any)._id);
      await this.permissionRepository.deleteMany({ _id: { $in: deleteIds } });
    }

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

  async delete(id: string, identity: any) {
    await this.permissionRepository.findOneOrFail(
      {
        _id: id,
        organization: identity.organization._id,
      },
      ErrorMessageEnum.FORBIDDEN,
    );

    await this.rolePermissionService.cascadeDeleteByPermission(id);

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
        populate: [{ path: 'role' }],
      },
    );

    if (userDoc.isBlocked === true) {
      return false;
    }

    if (!userDoc.role) {
      throw new AppHttpException(ErrorMessageEnum.INSUFFICIENT_PERMISSIONS);
    }

    const rolePermissions =
      await this.rolePermissionService.getPermissionsForRole(
        userDoc.role._id.toString(),
      );

    const hasPermission = rolePermissions.some(
      (rp: any) => rp.permission._id.toString() === dto.permissionId,
    );

    if (!hasPermission) {
      throw new AppHttpException(ErrorMessageEnum.INSUFFICIENT_PERMISSIONS);
    }

    return hasPermission;
  }
}
