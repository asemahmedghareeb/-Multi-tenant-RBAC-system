import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersDbModule } from './db/user.db.module';
import { identitiesDbModule } from '../identities/db/identities.db.module';
import { AuthModule } from '../auth/auth.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { UserTokensModule } from '../user-tokens/user-tokens.module';

@Module({
  imports: [usersDbModule, identitiesDbModule, UserTokensModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
