import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { User, UserDocument } from './entities/user.entity';


@Injectable()
export class UsersService extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    // Pass the model up to the BaseRepository
    super(userModel);
  }

  // You can still add custom, specific methods here if needed!
  async findByEmail(email: string) {
   
    // await this.findOneOrFail({ email }, 'User with this email does not exist');

   return  await this.findPaginated();

  }
}