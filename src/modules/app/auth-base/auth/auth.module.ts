import { Global, Module } from '@nestjs/common';
import { jwtModule } from 'src/modules/core/jwt/jwt.module';
import { NodeMailerModule } from 'src/modules/core/mailer/mailer.module';
import { ApiKeysModule } from '../../api-keys/api-keys.module';
import { apiKeysDbModule } from '../../api-keys/db/api-keys.db.module';
import { identitiesDbModule } from '../identities/db/identities.db.module';
import { organizationDbModule } from '../../organization/db/organization.db.module';
import { UserTokensModule } from '../user-tokens/user-tokens.module';
import { userTokensDbModule } from '../user-tokens/db/user-tokens.db.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { AuthHelper } from './helpers/auth.helper';
import { RepositoryModule } from 'src/common/repositories/repository.module';

@Global()
@Module({
  imports: [
    RepositoryModule.fromDbModules([
      identitiesDbModule,
      organizationDbModule,
      apiKeysDbModule,
      userTokensDbModule,
    ]),
    UserTokensModule,
    NodeMailerModule,
    jwtModule,
    ApiKeysModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthHelper, AuthGuard],
  exports: [AuthGuard, RepositoryModule],
})
export class AuthModule {}
