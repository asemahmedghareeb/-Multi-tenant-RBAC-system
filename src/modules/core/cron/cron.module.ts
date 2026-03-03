import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { IdentitiesModule } from 'src/modules/app/auth-base/identities/identities.module';

@Module({
  imports: [ScheduleModule.forRoot(), IdentitiesModule],
  providers: [CronService],
  exports: [CronService],
})
export class CronModule {}
