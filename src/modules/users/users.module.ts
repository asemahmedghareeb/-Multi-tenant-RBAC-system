import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersDbModule } from './db/user.db.module';

@Module({
  imports: [usersDbModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
