import { Injectable } from '@nestjs/common';
import { UserToken, UserTokenDocument } from './entities/user-token.entity';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';

@Injectable()
export class UserTokensService {
  constructor(
    @InjectRepository(UserToken)
    private readonly userTokensRepository: BaseRepository<UserTokenDocument>,
  ) {}

  async createTokenPair(data: {
    user: string;
    accessToken: string;
    refreshToken: string;
  }) {
    await this.userTokensRepository.deleteMany({ user: data.user });

    return await this.userTokensRepository.createOne(data);
  }

  async create(data: { user: string; token?: string; accessToken?: string }) {
    const accessToken = data.accessToken || data.token;
    return await this.userTokensRepository.createOne({
      user: data.user,
      accessToken,
    });
  }

  async updateAccessToken(userId: string, accessToken: string) {
    return await this.userTokensRepository.model.findOneAndUpdate(
      { user: userId },
      { accessToken },
      { returnDocument: 'after' },
    );
  }

  async deleteMany(filter: { user: string }) {
    await this.userTokensRepository.deleteMany(filter);
  }
}
