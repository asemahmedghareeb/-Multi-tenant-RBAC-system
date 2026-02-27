import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { MailQueueProcessor } from './mail-queue.processor';
import { MAIL_QUEUE } from './enums/mail-job.enum';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get<string>('EMAIL_HOST'),
                    port: configService.get<number>('EMAIL_PORT'),
                    secure: configService.get<boolean>('EMAIL_SECURE') === true,
                    auth: {
                        user: configService.get<string>('EMAIL'),
                        pass: configService.get<string>('EMAIL_PASSWORD'),
                    },
                },
                defaults: {
                    from: `${configService.get<string>('APP_NAME')} <${configService.get<string>('EMAIL_USER')}>`,
                },
            }),
        }),
        BullModule.registerQueue({ name: MAIL_QUEUE }),
    ],
    providers: [MailService, MailQueueProcessor],
    exports: [MailService],
})
export class NodeMailerModule {}

