import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { apiKeysDbModule } from './db/api-keys.db.module';
import { ApiKeyGeneratorHelper } from './helpers/api-key-generator.helper';
import { RepositoryModule } from 'src/common/repositories/repository.module';
import { organizationDbModule } from '../organization/db/organization.db.module';
import { ReturnObject } from 'src/common/return-object/return-object';

@Module({
  imports: [
    RepositoryModule.fromDbModules([apiKeysDbModule, organizationDbModule]),
  ],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyGeneratorHelper, ReturnObject],
  exports: [ApiKeyGeneratorHelper],
})
export class ApiKeysModule {}
