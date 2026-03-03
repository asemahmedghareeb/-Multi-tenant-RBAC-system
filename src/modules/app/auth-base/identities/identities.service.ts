import { Injectable } from '@nestjs/common';
import { Identity, IdentityDocument } from './entities/identity.entity';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';

@Injectable()
export class IdentitiesService {
  constructor(
    @InjectRepository(Identity)
    private readonly identitiesRepository: BaseRepository<IdentityDocument>,
  ) {}

  async deleteUnverifiedIdentitiesOlderThanWeek() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const result = await this.identitiesRepository.deleteMany({
      isVerified: false,
      createdAt: { $lt: oneWeekAgo },
    });
    return result || 0;
  }
}
