import { PaginationDto } from './../users/dto/pagination.dto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { ApiKey, ApiKeyDocument } from './entities/api-key.entity';
import { SubscriptionTiers } from './enums/subscribtion-tiers.enum';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Organization } from '../organization/entities/organization.entity';
import { TIER_LIMITS } from './enums/subscribtion-limits.enum';
import { ApiKeyGeneratorHelper } from './helpers/api-key-generator.helper';
import { Transactional } from 'src/common/decorators/transactional.decorator';

@Injectable()
export class ApiKeysService extends BaseRepository<ApiKeyDocument> {
  constructor(
    @InjectModel(ApiKey.name)
    private readonly apiKeyModel: Model<ApiKeyDocument>,
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<Organization>,
    private readonly apiKeyGeneratorHelper: ApiKeyGeneratorHelper,
  ) {
    super(apiKeyModel);
  }

  @Transactional()
  async create(identity: any) {
    const organization = identity.organization;
    const orga: any = await this.organizationModel
      .findById(organization)
      .populate('apiKeys')
      .exec();

    const apiKeys = orga.apiKeys;

    switch (organization.subscriptionTier) {
      case SubscriptionTiers.FREE:
        if (apiKeys.length >= TIER_LIMITS[SubscriptionTiers.FREE].maxKeys) {
          throw new ForbiddenException(
            `Free tier allows only ${TIER_LIMITS[SubscriptionTiers.FREE].maxKeys} API key`,
          );
        }
      case SubscriptionTiers.PRO:
        if (apiKeys.length >= TIER_LIMITS[SubscriptionTiers.PRO].maxKeys) {
          throw new ForbiddenException(
            `Pro tier allows only ${TIER_LIMITS[SubscriptionTiers.PRO].maxKeys} API keys`,
          );
        }

      case SubscriptionTiers.ENTERPRISE:
        if (
          apiKeys.length >= TIER_LIMITS[SubscriptionTiers.ENTERPRISE].maxKeys
        ) {
          throw new ForbiddenException(
            `Enterprise tier allows only ${TIER_LIMITS[SubscriptionTiers.ENTERPRISE].maxKeys} API keys`,
          );
        }
        break;
    }
    const apiKey = await this.createOne({
      organization: organization._id,
      key: this.apiKeyGeneratorHelper.generateApiKey(),
      tier: organization.subscriptionTier,
    });

    return apiKey;
  }

  async findAll(PaginationDto: PaginationDto, identity: any) {
    return this.findPaginated(
      { organization: identity.organization._id },
      { createdAt: -1 },
      PaginationDto.page,
      PaginationDto.limit,
    );
  }

  findOne(id: string) {
    return this.findOneOrFail({ _id: id }, 'API key not found');
  }

  @Transactional()
  async remove(id: string, identity: any) {
    const apiKey = await this.findOneOrFail({ _id: id }, 'API key not found');

    if (
      apiKey.organization.toString() !== identity.organization._id.toString()
    ) {
      throw new ForbiddenException(
        'You do not have permission to delete this API key',
      );
    }

    await this.apiKeyModel.deleteOne({ _id: id }).exec();
    return true;
  }
}
