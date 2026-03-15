import { Injectable } from '@nestjs/common';
import { Identity, IdentityDocument } from './entities/identity.entity';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { OrganizationService } from 'src/modules/app/organization/organization.service';

@Injectable()
export class IdentitiesService {
  constructor(
    @InjectRepository(Identity)
    private readonly identitiesRepository: BaseRepository<IdentityDocument>,
    private readonly organizationService: OrganizationService,
  ) {}

  async deleteUnverifiedIdentitiesOlderThanWeek(): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Find unverified identities older than a week
    const unverifiedIdentities = await (this.identitiesRepository as any).model.find({
      isVerified: false,
      createdAt: { $lt: oneWeekAgo },
    });

    // Extract identity IDs
    const identityIds = unverifiedIdentities.map((identity) => identity._id);

    // Bulk delete all associated organizations
    if (identityIds.length > 0) {
      try {
        await (this.organizationService as any).organizationRepository?.deleteMany({
          identity: { $in: identityIds },
        });
      } catch (error) {
        console.error('Error deleting organizations:', error);
      }
    }

    // Delete the identities
    const result = await this.identitiesRepository.deleteMany({
      isVerified: false,
      createdAt: { $lt: oneWeekAgo },
    });

    return result || 0;
  }
}
