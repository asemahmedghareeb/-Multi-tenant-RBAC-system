import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { Auth } from './modules/auth/decorators/auth.decorator';
import { CurrentUser } from './modules/auth/decorators/current-user.decorator';
import { DefaultPermissionActionsEnum } from './common/enums/default-permissions.enum';
import { User } from './modules/users/entities/user.entity';
import { Organization } from './modules/organization/entities/organization.entity';
import { Identity } from './modules/identities/entities/identity.entity';
import { UserType } from './modules/auth/enums/user-type.enum';

@Controller()
export class AppController {
  @Auth({ validateToken: true, roles: [UserType.ORGANIZATION] })
  @Get('admin-only')
  adminOnlyEndpoint(@CurrentUser() user: Identity) {
    return { message: 'Only admins can access this', user };
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
    return { message: 'Creating user', data };
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
    return { message: 'Deleting user', userId: id };
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
    return { message: 'Requires multiple permissions' };
  }

  /**
   * Example 5: Access current authenticated user
   */
  //   @Auth({ roles: [UserRoleEnum.USER] })
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return {
      id: user._id,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin,
    };
  }

  /**
   * Example 6: Just authentication required (no specific role/permission)
   */
  @Auth({})
  @Get('authenticated-only')
  authenticatedOnly(@CurrentUser() user: any) {
    return {
      message: 'Any authenticated user can access this',
      userId: user._id,
    };
  }
}
