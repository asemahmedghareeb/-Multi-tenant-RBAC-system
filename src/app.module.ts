import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ApiKeysModule } from './modules/app/api-keys/api-keys.module';
import { AuthModule } from './modules/app/auth-base/auth/auth.module';
import { IdentitiesModule } from './modules/app/auth-base/identities/identities.module';
import { UserTokensModule } from './modules/app/auth-base/user-tokens/user-tokens.module';
import { OrganizationModule } from './modules/app/organization/organization.module';
import { RolesModule } from './modules/app/roles/roles.module';
import { UsersModule } from './modules/app/users/users.module';
import { configModule } from './modules/core/config/config.module';
import { databaseRootModule } from './modules/core/database/database.module';
import { jwtModule } from './modules/core/jwt/jwt.module';
import { AppExceptionFilter } from './common/filters/exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { AppHelperModule } from './modules/core/app-helper/app-helper.module';
import { I18nModule } from 'nestjs-i18n';
import { I18nConfig } from './modules/core/config/i18n/i18n.config';

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
    AppHelperModule,
    I18nModule.forRootAsync(I18nConfig),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
  ],
})
export class AppModule {}
