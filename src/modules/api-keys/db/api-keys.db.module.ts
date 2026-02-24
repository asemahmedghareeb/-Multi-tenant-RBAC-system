import { MongooseModule } from '@nestjs/mongoose';
import { ApiKey, ApiKeySchema } from '../entities/api-key.entity';

export const apiKeysDbModule = MongooseModule.forFeature([
  { name: ApiKey.name, schema: ApiKeySchema },
]);
