import { createDbModule } from 'src/common/repositories/repository.module';
import {
  Organization,
  OrganizationSchema,
} from '../entities/organization.entity';

export const organizationDbModule = createDbModule(
  Organization,
  OrganizationSchema,
);
