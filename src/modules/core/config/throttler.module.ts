import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

export const throttlerModule = ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,
    limit: 10,
  },
  {
    name: 'long',
    ttl: 60000,
    limit: 100,
  },
]);

@Module({
  imports: [throttlerModule],
  exports: [ThrottlerModule],
})
export class ThrottlerConfigModule {}
