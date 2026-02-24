import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { identitiesDbModule } from '../identities/db/identities.db.module';
import { organizationDbModule } from '../organization/db/organization.db.module';
import { AuthHelper } from './helpers/auth.helper';
import { jwtModule } from 'src/core/jwt/jwt.module';
import { UserTokensModule } from '../user-tokens/user-tokens.module';
import { NodeMailerModule } from '../mailer/mailer.module';
import { apiKeysDbModule } from '../api-keys/db/api-keys.db.module';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    identitiesDbModule,
    organizationDbModule,
    apiKeysDbModule,
    UserTokensModule,
    NodeMailerModule,
    jwtModule,
    ApiKeysModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthHelper],
})
export class AuthModule {}
