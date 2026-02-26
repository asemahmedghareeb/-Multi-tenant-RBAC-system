import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(to: string, subject: string, html: string) {
    const mailOptions = {
      to,
      subject,
      html,
    };

    await this.mailerService.sendMail({
      ...mailOptions,
    });
    return true;
  }
}
