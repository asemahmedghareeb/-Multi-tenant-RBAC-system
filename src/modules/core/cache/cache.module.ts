import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<RedisClientType> => {
        const client: RedisClientType = createClient({
          url: configService.get<string>('REDIS_URL'),
        });

        client.on('error', (err) => console.error('Redis error:', err));
        // client.on('connect', () => console.log('Connected to Redis'));

        await client.connect();
        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class CacheModule {}
