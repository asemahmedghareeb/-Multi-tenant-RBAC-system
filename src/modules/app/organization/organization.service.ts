import { Injectable } from '@nestjs/common';
import {
  Organization,
  OrganizationDocument,
} from './entities/organization.entity';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { Transactional } from 'src/common/decorators/transactional.decorator';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization)
    private readonly organizationRepository: BaseRepository<OrganizationDocument>,
  ) {}

  @Transactional()
  async upgradeSubscription(
    upgradeSubscriptionDto: UpgradeSubscriptionDto,
    identity: any,
  ) {
    const updatedOrganization =
      await this.organizationRepository.model.findOneAndUpdate(
        { _id: identity.organization._id },
        { subscriptionTier: upgradeSubscriptionDto.subscriptionTier },
      );

    if (!updatedOrganization) {
      throw new AppHttpException(ErrorCodeEnum.NOT_FOUND);
    }

    return true;
  }
}
