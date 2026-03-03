import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { IdentitiesService } from 'src/modules/app/auth-base/identities/identities.service';

@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly identitiesService: IdentitiesService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  onModuleInit() {
    // Initialize dynamic jobs here if needed
  }

  @Cron('0 0 2 * * *')
  async cleanupUnverifiedIdentities() {
    try {
      const deletedCount =
        await this.identitiesService.deleteUnverifiedIdentitiesOlderThanWeek();

      this.logger.log(
        `Successfully deleted ${deletedCount} unverified identities older than 1 week`,
      );
    } catch (error) {
      this.logger.error(
        `Error cleaning up unverified identities: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Dynamically add a new cron job at runtime
   * @param id - Unique identifier for the job
   * @param cronTime - Cron expression (e.g., '0 0 2 * * *')
   * @param callback - Function to execute
   */
  addJob(id: string, cronTime: string, callback: () => void | Promise<void>) {
    if (this.schedulerRegistry.doesExist('cron', id)) {
      this.logger.warn(`🤖 Job ${id} already exists`);
      return;
    }

    const job = new CronJob(cronTime, callback);
    this.schedulerRegistry.addCronJob(id, job);
    job.start();

    this.logger.log(`✅ Scheduled job ${id} with cron: ${cronTime}`);
  }


  async stopJob(id: string) {
    try {
      const job = this.schedulerRegistry.getCronJob(id);
      job?.stop();
      this.logger.log(`⏸️ Stopped job ${id}`);
    } catch (error) {
      this.logger.error(`Error stopping job ${id}: ${error.message}`);
    }
  }

  deleteJob(id: string) {
    try {
      this.schedulerRegistry.deleteCronJob(id);
      this.logger.log(`🗑️ Deleted job ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting job ${id}: ${error.message}`);
    }
  }

  listJobs(): Map<string, CronJob> {
    return this.schedulerRegistry.getCronJobs();
  }
}
