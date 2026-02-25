import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

export const jwtModule = JwtModule.registerAsync({
    global: true,
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            console.warn('⚠️  JWT_SECRET not found in environment variables! Using fallback secret.');
            console.warn('This will cause token signature mismatches!');
        } else {
            console.log('✓ JWT_SECRET loaded from environment');
        }
        return {
            secret: secret || 'your-secret-key-change-in-production',
            signOptions: { expiresIn: '7d' },
        };
    },
});

