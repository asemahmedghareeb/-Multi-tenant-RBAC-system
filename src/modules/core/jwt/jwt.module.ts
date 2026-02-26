import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

export const jwtModule = JwtModule.registerAsync({
    global: true,
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        return {
            secret: secret || 'your-secret-key-change-in-production',
            signOptions: { expiresIn: '7d' },
        };
    },
});

