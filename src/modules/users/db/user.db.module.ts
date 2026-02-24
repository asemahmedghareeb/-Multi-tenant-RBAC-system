import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../entities/user.entity';

export const usersDbModule = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);
