import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { MAIL_QUEUE, MailJob } from './enums/mail-job.enum';

export interface SendEmailJobData {
  to: string;
  subject: string;
  html: string;
}

@Processor(MAIL_QUEUE)
export class MailQueueProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<SendEmailJobData>): Promise<void> {
    switch (job.name) {
      case MailJob.SEND_EMAIL:
        await this.mailerService.sendMail({
          to: job.data.to,
          subject: job.data.subject,
          html: job.data.html,
        });
        break;
    }
  }
}
