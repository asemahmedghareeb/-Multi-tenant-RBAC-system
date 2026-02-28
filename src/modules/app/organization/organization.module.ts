import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { organizationDbModule } from './db/organization.db.module';
import { RepositoryModule } from 'src/common/repositories/repository.module';

@Module({
  imports: [RepositoryModule.fromDbModules([organizationDbModule])],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
