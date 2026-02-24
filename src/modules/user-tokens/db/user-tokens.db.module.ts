import { MongooseModule } from '@nestjs/mongoose';
import { UserToken, UserTokenSchema } from '../entities/user-token.entity';

export const userTokensDbModule = MongooseModule.forFeature([
    { name: UserToken.name, schema: UserTokenSchema },
]);
