import { Global, Module } from '@nestjs/common';
import { UserTokensService } from './user-tokens.service';
import { userTokensDbModule } from './db/user-tokens.db.module';

@Global()
@Module({
  imports: [userTokensDbModule],
  providers: [UserTokensService],
  exports: [UserTokensService, userTokensDbModule],
})
export class UserTokensModule {}
