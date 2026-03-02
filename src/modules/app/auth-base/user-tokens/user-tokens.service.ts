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
    // Delete any existing token pair for this user
    await this.userTokensRepository.deleteMany({ user: data.user });

    // Create new token pair document
    return await this.userTokensRepository.createOne(data);
  }

  /**
   * Create or update a single access token (backward compatibility)
   *
   * @param data User ID and access token
   */
  async create(data: { user: string; token?: string; accessToken?: string }) {
    const accessToken = data.accessToken || data.token;
    return await this.userTokensRepository.createOne({
      user: data.user,
      accessToken,
    });
  }

  /**
   * Update only the access token for a user (for refresh token flow)
   * Keeps the refresh token intact
   *
   * @param userId User ID
   * @param accessToken New access token
   */
  async updateAccessToken(userId: string, accessToken: string) {
    return await this.userTokensRepository.model.findOneAndUpdate(
      { user: userId },
      { accessToken },
      { returnDocument: 'after' },
    );
  }

  /**
   * Delete all tokens for a user (logout from all devices)
   */
  async deleteMany(filter: { user: string }) {
    await this.userTokensRepository.deleteMany(filter);
  }
}
