import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

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
    ],
    providers: [MailService],
    exports: [MailService],
})
export class NodeMailerModule {}
