import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { PermissionsService } from '../services/permissions.service';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth } from '../../auth-base/auth/decorators/auth.decorator';
import { UserType } from '../../auth-base/auth/enums/user-type.enum';
import { CurrentUser } from '../../auth-base/auth/decorators/current-user.decorator';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { CheckUserHasPermissionDto } from '../dto/check-user-has-permission.dto';
import { ApiUtil } from 'src/common/utils/response-util';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionsService) {}

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Get('organization-permissions')
  async getPermissions(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() identity: any,
  ) {
    const result = await this.permissionService.findAll(
      paginationDto,
      identity,
    );
    return ApiUtil.formatResponse(
      200,
      ResponseMessageEnum.SUCCESS,
      result.items,
    );
  }

  @Auth({
    roles: [UserType.ORGANIZATION],
  })
  @Post()
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
    @CurrentUser() currentUser: any,
  ) {
    const result = await this.permissionService.createPermission(
      createPermissionDto,
      currentUser,
    );
    return ApiUtil.formatResponse(201, ResponseMessageEnum.SUCCESS, result);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Get(':id')
  async getPermission(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() currentUser: any,
  ) {
    const result = await this.permissionService.findOne(id, currentUser);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, result);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Delete(':id')
  async deletePermission(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() identity: any,
  ) {
    const result = await this.permissionService.delete(id, identity);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, result);
  }

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Post('check-user-has-permission')
  async checkPermission(
    @Body() dto: CheckUserHasPermissionDto,
    @CurrentUser() identity: any,
  ) {
    const result = await this.permissionService.checkUserHasPermission(
      dto,
      identity,
    );
    
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, result);
  }
}
