import { createDbModule } from 'src/common/repositories/repository.module';
import { User, UserSchema } from '../entities/user.entity';

export const usersDbModule = createDbModule(User, UserSchema);
