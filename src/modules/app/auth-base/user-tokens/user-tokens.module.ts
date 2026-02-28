import { Global, Module } from '@nestjs/common';
import { UserTokensService } from './user-tokens.service';
import { userTokensDbModule } from './db/user-tokens.db.module';
import { RepositoryModule } from 'src/common/repositories/repository.module';

@Global()
@Module({
  imports: [RepositoryModule.fromDbModules([userTokensDbModule])],
  providers: [UserTokensService],
  exports: [UserTokensService],
})
export class UserTokensModule {}
