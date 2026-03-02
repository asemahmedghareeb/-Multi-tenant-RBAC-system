import { Global, Module } from '@nestjs/common';
import { AppHelperService } from './services/app-helper.service';
import { SeedingService } from './services/seeding.service';
import { RepositoryModule } from 'src/common/repositories/repository.module';
import { identitiesDbModule } from '../../app/auth-base/identities/db/identities.db.module';
import { organizationDbModule } from '../../app/organization/db/organization.db.module';
import { rolesDbModule } from '../../app/auth-base/roles/db/roles.db.module';
import { permissionDbModule } from '../../app/auth-base/roles/db/permission.db.module';
import { rolePermissionDbModule } from '../../app/auth-base/roles/db/role-permission.db.module';
import { RolePermissionService } from '../../app/auth-base/roles/services/role-permission.service';
import { RolesModule } from '../../app/auth-base/roles/roles.module';

@Global()
@Module({
  imports: [
    RepositoryModule.fromDbModules([
      identitiesDbModule,
      organizationDbModule,
      rolesDbModule,
      permissionDbModule,
      rolePermissionDbModule,
    ]),
    RolesModule,
  ],
  providers: [AppHelperService, SeedingService, RolePermissionService],
  exports: [AppHelperService],
})
export class AppHelperModule {}
