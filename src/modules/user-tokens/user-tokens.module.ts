import { Module } from '@nestjs/common';
import { UserTokensService } from './user-tokens.service';
import { userTokensDbModule } from './db/user-tokens.db.module';

@Module({
    imports: [userTokensDbModule],
    providers: [UserTokensService],
    exports: [UserTokensService, userTokensDbModule],
})
export class UserTokensModule {}
