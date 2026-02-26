import { createDbModule } from 'src/common/repositories/repository.module';
import { Role, RoleSchema } from '../entities/role.entity';

export const rolesDbModule = createDbModule(Role, RoleSchema);
