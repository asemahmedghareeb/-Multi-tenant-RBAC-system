import { CurrentUser } from './../../auth-base/auth/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';
import { RolePermissionService } from '../services/role-permission.service';

import { Auth } from '../../auth-base/auth/decorators/auth.decorator';
import { UserType } from '../../auth-base/auth/enums/user-type.enum';
import { AddRoleDto } from '../dto/add-role.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { AddOrRemovePermissionsDto } from '../dto/add-or-remove-permissions.dto';
import { AssignRoleToUserDto } from '../dto/assign-role-to-user.dto';
import { ApiUtil } from 'src/common/utils/response-util';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly rolePermissionService: RolePermissionService,
  ) {}

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Post()
  async create(
    @Body() createRoleDto: AddRoleDto,
    @CurrentUser() identity: any,
  ) {
    const result = await this.rolesService.create(createRoleDto, identity);
    return ApiUtil.formatResponse(201, ResponseMessageEnum.SUCCESS, result);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Get('organization-roles')
  async findAll(
    @Param() paginationDto: PaginationDto,
    @CurrentUser() identity: any,
  ) {
    const result = await this.rolesService.findAll(paginationDto, identity);
    return ApiUtil.formatResponse(
      200,
      ResponseMessageEnum.SUCCESS,
      result.items,
      result.pageInfo,
    );
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Delete(':id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() identity: any,
  ) {
    const result = await this.rolesService.delete(id, identity);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, result);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Get(':id/permissions')
  async getRolePermissions(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() identity: any,
  ) {
    // Validate that the role belongs to the user's organization
    await this.rolesService.findOne(id, identity);

    const rolePermissions = await this.rolePermissionService.getPermissionsForRole(id);
    const permissions = rolePermissions.map((rp: any) => rp.permission);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, permissions);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Get(':id/permissions/:permissionId')
  async checkRolePermission(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('permissionId', ParseObjectIdPipe) permissionId: string,
    @CurrentUser() identity: any,
  ) {
    // Validate that the role belongs to the user's organization
    await this.rolesService.findOne(id, identity);

    const hasPermission = await this.rolePermissionService.hasPermission(id, permissionId);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, {
      hasPermission,
    });
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Get(':id')
  async findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() identity: any,
  ) {
    const result = await this.rolesService.findOne(id, identity);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, result);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Patch('assign-permissions')
  async assignPermissionsToRole(
    @Body() addPermissionDto: AddOrRemovePermissionsDto,
    @CurrentUser() identity,
  ) {
    return this.rolesService.assignPermissionsToRole(
      addPermissionDto,
      identity,
    );
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Patch('assign-role-to-user')
  async assignRoleToUser(
    @Body() assignRoleToUserDto: AssignRoleToUserDto,
    @CurrentUser() identity: any,
  ) {
    return this.rolesService.assignRoleToUser(assignRoleToUserDto, identity);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Patch('remove-role-from-user')
  async removeRoleFromUser(
    @Body() assignRoleToUserDto: AssignRoleToUserDto,
    @CurrentUser() identity: any,
  ) {
    return this.rolesService.removeRoleFromUser(assignRoleToUserDto, identity);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Patch('remove-permissions-from-role')
  async removePermissionsFromRole(
    @Body() removePermissionsDto: AddOrRemovePermissionsDto,
    @CurrentUser() identity: any,
  ) {
    return this.rolesService.removePermissionsFromRole(
      removePermissionsDto,
      identity,
    );
  }
}
