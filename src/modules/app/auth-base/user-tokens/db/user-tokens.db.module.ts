import { createDbModule } from 'src/common/repositories/repository.module';
import { UserToken, UserTokenSchema } from '../entities/user-token.entity';

export const userTokensDbModule = createDbModule(UserToken, UserTokenSchema);
