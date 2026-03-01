import { PaginationDto } from './../../../../common/dtos/pagination.dto';
import { Injectable } from '@nestjs/common';
import { Role, RoleDocument } from '../entities/role.entity';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { AddRoleDto } from '../dto/add-role.dto';
import { ErrorMessageEnum } from 'src/common/enums/error-message.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { AddOrRemovePermissionsDto } from '../dto/add-or-remove-permissions.dto';
import { AssignRoleToUserDto } from '../dto/assign-role-to-user.dto';
import { User, UserDocument } from '../../users/entities/user.entity';
import {
  Identity,
  IdentityDocument,
} from '../../auth-base/identities/entities/identity.entity';
import { Permission, PermissionDocument } from '../entities/permission.entity';
import { ReturnObject } from 'src/common/return-object/return-object';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: BaseRepository<RoleDocument>,
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<UserDocument>,
    @InjectRepository(Identity)
    private readonly identityRepository: BaseRepository<IdentityDocument>,
    @InjectRepository(Permission)
    private readonly permissionRepository: BaseRepository<PermissionDocument>,
    private readonly returnObject: ReturnObject,
  ) {}

  async create(createRoleDto: AddRoleDto, identity: any) {
    await this.roleRepository.findOneAndFail({
      $or: [
        {
          'name.en': createRoleDto.nameEn,
          organization: identity.organization._id,
        },
        {
          'name.ar': createRoleDto.nameAr,
          organization: identity.organization._id,
        },
      ],
    });

    return this.roleRepository.createOne(
      {
        ...createRoleDto,
        name: {
          ar: createRoleDto.nameAr,
          en: createRoleDto.nameEn,
        },
        organization: identity.organization._id,
      },
      this.returnObject.role,
    );
  }

  async findAll(paginationDto: PaginationDto, identity: any) {
    return this.roleRepository.findPaginated(
      { organization: identity.organization._id },
      { 'name.en': 1, 'name.ar': 1 },
      paginationDto.page,
      paginationDto.limit,
      {},
      this.returnObject.role,
    );
  }

  async delete(id: string, identity: any) {
    return this.roleRepository.deleteOneOrFail(
      {
        _id: id,
        organization: identity.organization._id,
      },
      ErrorMessageEnum.FORBIDDEN,
    );
  }

  async findOne(id: string, identity: any) {
    return this.roleRepository.findOneOrFail(
      {
        _id: id,
        organization: identity.organization._id,
      },
      undefined,
      undefined,
      this.returnObject.role,
    );
  }

  async assignPermissionsToRole(
    addPermissionDto: AddOrRemovePermissionsDto,
    identity: any,
  ) {
    const role = await this.roleRepository.findOneOrFail(
      {
        _id: addPermissionDto.id,
        organization: identity.organization._id,
      },
      undefined,
      {
        populate: [{ path: 'permissions' }],
      },
    );

    const foundPermissions = await this.permissionRepository.model
      .find({
        _id: { $in: addPermissionDto.permissions },
        organization: identity.organization._id,
      })
      .exec();

    if (foundPermissions.length !== addPermissionDto.permissions.length) {
      throw new AppHttpException(ErrorMessageEnum.NOT_FOUND);
    }

    role.permissions.push(...(addPermissionDto.permissions as any));
    await role.save();
    return true;
  }

  async assignRoleToUser(dto: AssignRoleToUserDto, identity: any) {
    const role = await this.roleRepository.findOneOrFail({
      _id: dto.roleId,
      organization: identity.organization._id,
    });

    const user = await this.userRepository.findOneOrFail(
      {
        _id: dto.userId,
        organization: identity.organization._id,
      },
      ErrorMessageEnum.NOT_FOUND,
    );

    await this.userRepository.model.findOneAndUpdate(
      { _id: user._id },
      { role: role._id },
    );

    return true;
  }

  async removeRoleFromUser(dto: AssignRoleToUserDto, identity: any) {
    const user = await this.userRepository.findOneOrFail(
      {
        _id: dto.userId,
        organization: identity.organization._id,
      },
      ErrorMessageEnum.NOT_FOUND,
    );

    await this.userRepository.model.findOneAndUpdate(
      { _id: user._id },
      { role: null },
    );

    return true;
  }

  async removePermissionsFromRole(
    addPermissionDto: AddOrRemovePermissionsDto,
    identity: any,
  ) {
    const role = await this.roleRepository.findOneOrFail(
      {
        _id: addPermissionDto.id,
        organization: identity.organization._id,
      },
      undefined,
      {
        populate: [{ path: 'permissions' }],
      },
    );

    const foundPermissions = await this.permissionRepository.model
      .find({
        _id: { $in: addPermissionDto.permissions },
        organization: identity.organization._id,
      })
      .exec();

    if (foundPermissions.length !== addPermissionDto.permissions.length) {
      throw new AppHttpException(ErrorMessageEnum.NOT_FOUND);
    }

    role.permissions = role.permissions.filter((p: Permission) => {
      return !addPermissionDto.permissions.includes(p._id.toString());
    }) as Permission[];

    await role.save();
    return true;
  }
}
