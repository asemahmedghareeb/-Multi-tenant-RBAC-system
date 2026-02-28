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

import { Auth } from '../../auth-base/auth/decorators/auth.decorator';
import { UserType } from '../../auth-base/auth/enums/user-type.enum';
import { AddRoleDto } from '../dto/add-role.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { AddOrRemovePermissionsDto } from '../dto/add-or-remove-permissions.dto';
import { AssignRoleToUserDto } from '../dto/assign-role-to-user.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Post()
  async create(
    @Body() createRoleDto: AddRoleDto,
    @CurrentUser() identity: any,
  ) {
    return this.rolesService.create(createRoleDto, identity);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Get('organization-roles')
  async findAll(
    @Param() paginationDto: PaginationDto,
    @CurrentUser() identity: any,
  ) {
    return this.rolesService.findAll(paginationDto, identity);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Delete(':id')
  async delete(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() identity: any,
  ) {
    return this.rolesService.delete(id, identity);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Get(':id')
  async findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() identity: any,
  ) {
    return this.rolesService.findOne(id, identity);
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
