import { createDbModule } from 'src/common/repositories/repository.module';
import { ApiKey, ApiKeySchema } from '../entities/api-key.entity';

export const apiKeysDbModule = createDbModule(ApiKey, ApiKeySchema);
