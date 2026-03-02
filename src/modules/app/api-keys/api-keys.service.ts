import { Injectable } from '@nestjs/common';
import { Transactional } from 'src/common/decorators/transactional.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { ApiKeyDocument, ApiKey } from './entities/api-key.entity';
import { TIER_LIMITS } from './enums/subscription-limits.enum';
import { SubscriptionTiers } from './enums/subscription-tiers.enum';
import { ApiKeyGeneratorHelper } from './helpers/api-key-generator.helper';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {
  Organization,
  OrganizationDocument,
} from '../organization/entities/organization.entity';
import { ErrorMessageEnum } from 'src/common/enums/error-message.enum';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { ReturnObject } from 'src/common/return-object/return-object';

@Injectable()
export class ApiKeysService {
  constructor(
    private readonly apiKeyGeneratorHelper: ApiKeyGeneratorHelper,
    @InjectRepository(Organization)
    private readonly organizationRepository: BaseRepository<OrganizationDocument>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: BaseRepository<ApiKeyDocument>,
    private readonly returnObject: ReturnObject,
  ) {}

  @Transactional()
  async create(identity: any) {
    const organization = identity.organization;
    const orga: any = await this.organizationRepository.model
      .findById(organization)
      .populate('apiKeys')
      .exec();

    const apiKeys = orga.apiKeys;

    switch (organization.subscriptionTier) {
      case SubscriptionTiers.FREE:
        if (apiKeys.length >= TIER_LIMITS[SubscriptionTiers.FREE].maxKeys) {
          throw new AppHttpException(
            ErrorMessageEnum.API_KEY_LIMIT_REACHED_FREE,
          );
        }
        break;
      case SubscriptionTiers.PRO:
        if (apiKeys.length >= TIER_LIMITS[SubscriptionTiers.PRO].maxKeys) {
          throw new AppHttpException(
            ErrorMessageEnum.API_KEY_LIMIT_REACHED_PRO,
          );
        }
        break;

      case SubscriptionTiers.ENTERPRISE:
        if (
          apiKeys.length >= TIER_LIMITS[SubscriptionTiers.ENTERPRISE].maxKeys
        ) {
          throw new AppHttpException(
            ErrorMessageEnum.API_KEY_LIMIT_REACHED_ENTERPRISE,
          );
        }
        break;
    }
    const apiKey = await this.apiKeyRepository.createOne({
      organization: organization._id,
      key: this.apiKeyGeneratorHelper.generateApiKey(),
      tier: organization.subscriptionTier,
    });

    return apiKey;
  }

  async findAll(PaginationDto: PaginationDto, identity: any) {
    return this.apiKeyRepository.findPaginated(
      { organization: identity.organization._id },
      { createdAt: -1 },
      PaginationDto.page,
      PaginationDto.limit,
      {},
      (apiKey) => this.returnObject.apiKey(apiKey),
    );
  }

  findOne(id: string) {
    return this.apiKeyRepository.findOneOrFail({ _id: id });
  }

  @Transactional()
  async remove(id: string, identity: any) {
    const apiKey = await this.apiKeyRepository.findOneOrFail({ _id: id });

    if (
      apiKey.organization.toString() !== identity.organization._id.toString()
    ) {
      throw new AppHttpException(ErrorMessageEnum.FORBIDDEN);
    }

    const apiKeyCount = await this.apiKeyRepository.model.countDocuments({
      organization: apiKey.organization,
    });

    if (apiKeyCount <= 1) {
      throw new AppHttpException(ErrorMessageEnum.CANNOT_DELETE_LAST_API_KEY);
    }

    await this.apiKeyRepository.deleteOne({ _id: id });
    return true;
  }
}
