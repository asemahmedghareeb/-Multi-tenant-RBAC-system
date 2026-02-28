import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MAIL_QUEUE, MailJob } from './enums/mail-job.enum';

@Injectable()
export class MailService {
  constructor(@InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue) {}

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    await this.mailQueue.add(
      MailJob.SEND_EMAIL,
      { to, subject, html },
      { attempts: 3, backoff: { type: 'exponential', delay: 5000 } },
    );
  }
}
