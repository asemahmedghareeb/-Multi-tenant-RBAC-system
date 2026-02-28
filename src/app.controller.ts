import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { DefaultPermissionActionsEnum } from './common/enums/default-permissions.enum';
import { Auth } from './modules/app/auth-base/auth/decorators/auth.decorator';
import { CurrentUser } from './modules/app/auth-base/auth/decorators/current-user.decorator';
import { UserType } from './modules/app/auth-base/auth/enums/user-type.enum';
import { Organization } from './modules/app/organization/entities/organization.entity';
import { User } from './modules/app/users/entities/user.entity';
import { Identity } from './modules/app/auth-base/identities/entities/identity.entity';

import { ApiUtil } from './common/utils/response-util';
import { ResponseMessageEnum } from './common/enums/response-message.enum';

@Controller()
export class AppController {
  // @Auth({ validateToken: true, roles: [UserType.ORGANIZATION] })
  @Get('admin-only')
  adminOnlyEndpoint(@CurrentUser() user: Identity) {
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, user);
  }

  @Auth({
    permissions: [
      {
        target: User.permissionsTarget,
        action: DefaultPermissionActionsEnum.CREATE,
      },
    ],
  })
  @Post('create-user')
  createUser(@Body() data: any) {
    return ApiUtil.formatResponse(201, ResponseMessageEnum.SUCCESS, { message: 'Creating user', data });
  }

  /**
   * Example 3: Require both role and permissions
   */
  @Auth({
    validateToken: true,
    roles: [UserType.USER],
    permissions: [
      {
        target: User.permissionsTarget,
        action: DefaultPermissionActionsEnum.DELETE,
      },
    ],
  })
  @Delete('delete-user/:id')
  deleteUser(@Param('id') id: string) {
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, { message: 'Deleting user', userId: id });
  }

  /**
   * Example 4: Multiple permission requirements
   */
  @Auth({
    permissions: [
      {
        target: User.permissionsTarget, // 'user'
        action: DefaultPermissionActionsEnum.READ,
      },
      {
        target: Organization.permissionsTarget, // 'organization'
        action: DefaultPermissionActionsEnum.UPDATE,
      },
    ],
  })
  @Get('complex-operation')
  complexOperation() {
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, { message: 'Requires multiple permissions' });
  }

  /**
   * Example 5: Access current authenticated user
   */
  //   @Auth({ roles: [UserRoleEnum.USER] })
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, {
      id: user._id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
    });
  }

  /**
   * Example 6: Just authentication required (no specific role/permission)
   */
  @Auth({})
  @Get('authenticated-only')
  authenticatedOnly(@CurrentUser() user: any) {
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, {
      message: 'Any authenticated user can access this',
      userId: user._id,
    });
  }
}
