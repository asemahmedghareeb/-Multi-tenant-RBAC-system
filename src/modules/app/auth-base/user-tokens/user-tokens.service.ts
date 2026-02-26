import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserToken } from './entities/user-token.entity';
import { Model } from 'mongoose';

@Injectable()
export class UserTokensService {
  constructor(
    @InjectModel(UserToken.name)
    private readonly userTokenModel: Model<UserToken>,
  ) {}

  async create(data: { user: string; token: string }) {
    return await this.userTokenModel.create(data);
  }

  async deleteMany(filter: { user: string }) {
    await this.userTokenModel.deleteMany(filter);
  }
}
