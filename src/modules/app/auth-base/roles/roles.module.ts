import { Module } from '@nestjs/common';
import { permissionDbModule } from './db/permission.db.module';
import { IdentitiesModule } from '../identities/identities.module';
import { RolesController } from './controllers/roles.controller';
import { rolesDbModule } from './db/roles.db.module';
import { PermissionsService } from './services/permissions.service';
import { RolesService } from './services/roles.service';
import { RepositoryModule } from 'src/common/repositories/repository.module';
import { PermissionController } from './controllers/permission.controller';
import { usersDbModule } from '../../users/db/user.db.module';
import { identitiesDbModule } from '../identities/db/identities.db.module';
import { ReturnObject } from 'src/common/return-object/return-object';
import { rolePermissionDbModule } from './db/role-permission.db.module';
import { RolePermissionService } from './services/role-permission.service';

@Module({
  imports: [
    IdentitiesModule,
    RepositoryModule.fromDbModules([
      permissionDbModule,
      rolesDbModule,
      usersDbModule,
      identitiesDbModule,
      rolePermissionDbModule,
    ]),
  ],
  controllers: [RolesController, PermissionController],
  providers: [RolesService, PermissionsService, RolePermissionService, ReturnObject],
  exports: [RolesService, PermissionsService, RolePermissionService],
})
export class RolesModule {}
