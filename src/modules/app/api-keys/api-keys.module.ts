import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { apiKeysDbModule } from './db/api-keys.db.module';
import { ApiKeyGeneratorHelper } from './helpers/api-key-generator.helper';
import { RepositoryModule } from 'src/common/repositories/repository.module';
import { organizationDbModule } from '../organization/db/organization.db.module';

@Module({
  imports: [
    RepositoryModule.fromDbModules([apiKeysDbModule, organizationDbModule]),
  ],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyGeneratorHelper],
  exports: [ApiKeyGeneratorHelper],
})
export class ApiKeysModule {}
