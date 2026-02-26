import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersDbModule } from './db/user.db.module';
import { organizationDbModule } from '../organization/db/organization.db.module';
import { identitiesDbModule } from '../auth-base/identities/db/identities.db.module';
import { RepositoryModule } from 'src/common/repositories/repository.module';

@Module({
  imports: [
    RepositoryModule.fromDbModules([usersDbModule, organizationDbModule, identitiesDbModule]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
