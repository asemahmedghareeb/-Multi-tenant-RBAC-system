import { Module } from '@nestjs/common';
import { IdentitiesService } from './identities.service';
import { identitiesDbModule } from './db/identities.db.module';
import { RepositoryModule } from 'src/common/repositories/repository.module';

@Module({
  imports: [RepositoryModule.fromDbModules([identitiesDbModule])],
  providers: [IdentitiesService],
  exports: [IdentitiesService],
})
export class IdentitiesModule {}
