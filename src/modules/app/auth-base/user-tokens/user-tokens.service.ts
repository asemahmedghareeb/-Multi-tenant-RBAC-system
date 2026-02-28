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

  async create(data: { user: string; token: string }) {
    return await this.userTokensRepository.createOne(data);
  }

  async deleteMany(filter: { user: string }) {
    await this.userTokensRepository.deleteMany(filter);
  }
}
