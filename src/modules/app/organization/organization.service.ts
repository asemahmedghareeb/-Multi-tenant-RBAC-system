import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import {
  Organization,
  OrganizationDocument,
} from './entities/organization.entity';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { Model } from 'mongoose';
import { Transactional } from 'src/common/decorators/transactional.decorator';

@Injectable()
export class OrganizationService extends BaseRepository<OrganizationDocument> {
  constructor(
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<OrganizationDocument>,
  ) {
    super(organizationModel);
  }
  
  findAll() {
    return `This action returns all organization`;
  }

  findOne(id: number) {
    return `This action returns a #${id} organization`;
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return `This action updates a #${id} organization`;
  }

  @Transactional()
  upgradeSubscription(id: string, subscriptionTier: string) {
    return `This action upgrades subscription of organization #${id} to ${subscriptionTier}`;
  }

  remove(id: number) {
    return `This action removes a #${id} organization`;
  }
}
