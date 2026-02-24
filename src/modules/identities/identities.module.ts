import { Module } from '@nestjs/common';
import { IdentitiesService } from './identities.service';
import { IdentitiesController } from './identities.controller';
import { identitiesDbModule } from './db/identities.db.module';

@Module({
    imports: [identitiesDbModule],
    controllers: [IdentitiesController],
    providers: [IdentitiesService],
    exports: [IdentitiesService],
})
export class IdentitiesModule {}
