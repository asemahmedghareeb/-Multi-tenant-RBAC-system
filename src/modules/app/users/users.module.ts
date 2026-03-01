import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersDbModule } from './db/user.db.module';
import { organizationDbModule } from '../organization/db/organization.db.module';
import { identitiesDbModule } from '../auth-base/identities/db/identities.db.module';
import { RepositoryModule } from 'src/common/repositories/repository.module';
import { ReturnObject } from 'src/common/return-object/return-object';

@Module({
  imports: [
    RepositoryModule.fromDbModules([
      usersDbModule,
      organizationDbModule,
      identitiesDbModule,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, ReturnObject],
})
export class UsersModule {}
