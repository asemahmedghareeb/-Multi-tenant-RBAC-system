import { Module } from '@nestjs/common';
import { databaseRootModule } from './core/database/database.module';
import { configModule } from './core/config/config.module';
import { jwtModule } from './core/jwt/jwt.module';
import { IdentitiesModule } from './modules/identities/identities.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
// import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserTokensModule } from './modules/user-tokens/user-tokens.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { AppController } from './app.controller';
import { OrganizationModule } from './modules/organization/organization.module';

@Module({
  imports: [
    databaseRootModule,
    configModule,
    jwtModule,
    AuthModule,
    IdentitiesModule,
    OrganizationModule,
    ApiKeysModule,
    RolesModule,
    UsersModule,
    UserTokensModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
