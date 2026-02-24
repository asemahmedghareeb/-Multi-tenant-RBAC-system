import { Module } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';
import { apiKeysDbModule } from './db/api-keys.db.module';
import { ApiKeyGeneratorHelper } from './helpers/api-key-generator.helper';

@Module({
  imports: [apiKeysDbModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, ApiKeyGeneratorHelper],
  exports: [ApiKeyGeneratorHelper],
})
export class ApiKeysModule {}
