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

  async verifyTokenInDatabase(token: string): Promise<boolean> {
    try {
      // Query the database to check if this token exists for this user
      const userToken = await this.userTokensRepository.findOne({
        accessToken: token,
      });

      return !!userToken;
    } catch (error) {
      console.error('Error verifying token in database:', error);
      return false;
    }
  }

  /**
   * Sign out from current device by deleting a specific token
   * @param userId - User ID
   * @param accessToken - Current access token to delete
   */
  async signOutFromDevice(
    userId: string,
    accessToken: string,
  ): Promise<boolean> {
    try {
      const result = await this.userTokensRepository.deleteMany({
        user: userId,
        accessToken,
      });
      return result > 0;
    } catch (error) {
      console.error('Error signing out from device:', error);
      throw error;
    }
  }

  /**
   * Sign out from all devices by deleting all tokens for a user
   * @param userId - User ID
   */
  async signOutFromAllDevices(userId: string): Promise<boolean> {
    try {
      const result = await this.userTokensRepository.deleteMany({
        user: userId,
      });
      return result > 0;
    } catch (error) {
      console.error('Error signing out from all devices:', error);
      throw error;
    }
  }
}
