
import { Module } from '@nestjs/common';
import { permissionDbModule } from './db/permsssion.db.module';
import { IdentitiesModule } from '../auth-base/identities/identities.module';
import { RolesController } from './controllers/roles.controller';
import { rolesDbModule } from './db/roles.db.module';
import { PermissionsService } from './services/permissions.service';
import { RolesService } from './services/roles.service';

@Module({
  imports: [rolesDbModule, IdentitiesModule,permissionDbModule],
  controllers: [RolesController],
  providers: [RolesService, PermissionsService],
  exports: [RolesService, PermissionsService],
})
export class RolesModule {}
