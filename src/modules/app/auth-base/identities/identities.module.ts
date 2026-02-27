import { Module } from '@nestjs/common';
import { identitiesDbModule } from './db/identities.db.module';

@Module({
  imports: [identitiesDbModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class IdentitiesModule {}
