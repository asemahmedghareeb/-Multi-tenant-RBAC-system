import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { rolesDbModule } from './db/roles.db.module';
import { PermissionsService } from './permissions.service';

import { IdentitiesModule } from '../identities/identities.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [rolesDbModule, IdentitiesModule],
  controllers: [RolesController],
  providers: [RolesService, PermissionsService],
  exports: [RolesService, PermissionsService],
})
export class RolesModule {}
