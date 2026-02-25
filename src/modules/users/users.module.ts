import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersDbModule } from './db/user.db.module';
import { identitiesDbModule } from '../identities/db/identities.db.module';

@Module({
  imports: [usersDbModule, identitiesDbModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
