import { createDbModule } from 'src/common/repositories/repository.module';
import { Identity, IdentitySchema } from '../entities/identity.entity';

export const identitiesDbModule = createDbModule(Identity, IdentitySchema);
