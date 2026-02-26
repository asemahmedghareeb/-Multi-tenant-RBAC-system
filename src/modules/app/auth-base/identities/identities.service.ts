import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Identity, IdentityDocument } from './entities/identity.entity';
import { Model } from 'mongoose';
import { Transactional } from 'src/common/decorators/transactional.decorator';
@Injectable()
export class IdentitiesService {
  constructor(
    @InjectModel(Identity.name)
    private readonly identityModel: Model<IdentityDocument>,
  ) {}

  @Transactional()
  async create(
    identity: Identity,
  ): Promise<IdentityDocument> {
    return await this.identityModel.create(identity);
  }

  async findById(
    id: string,
    options?: { populate?: any; lean?: boolean },
  ): Promise<IdentityDocument | null> {
    const query = this.identityModel.findById(id);

    if (options?.populate) query.populate(options.populate);
    if (options?.lean) query.lean();

    return await query.exec();
  }

  async findOne(
    filter: any,
    options?: { populate?: any; lean?: boolean },
  ): Promise<IdentityDocument | null> {
    const query = this.identityModel.findOne(filter);

    if (options?.populate) query.populate(options.populate);
    if (options?.lean) query.lean();

    return await query.exec();
  }

  async findWithPagination(
    filter: any,
    page: number = 1,
    limit: number = 10,
    options?: { populate?: any; lean?: boolean },
  ): Promise<IdentityDocument[]> {
    const skip = (page - 1) * limit;

    const query = this.identityModel.find(filter).skip(skip).limit(limit);

    if (options?.populate) query.populate(options.populate);
    if (options?.lean) query.lean();

    return await query.exec();
  }

  async find(
    filter: any,
    options?: { populate?: any; lean?: boolean },
  ): Promise<IdentityDocument[]> {
    const query = this.identityModel.find(filter);

    if (options?.populate) query.populate(options.populate);
    if (options?.lean) query.lean();

    return await query.exec();
  }

  async count(filter: any): Promise<number> {
    return await this.identityModel.countDocuments(filter);
  }

  async findByIdAndUpdate(
    id: string,
    identity: Partial<Identity>,
    options?: { populate?: any; lean?: boolean },
  ): Promise<IdentityDocument | null> {
    const query = this.identityModel.findByIdAndUpdate(id, identity, {
      new: true,
    });

    if (options?.populate) query.populate(options.populate);
    if (options?.lean) query.lean();

    return await query.exec();
  }

  async softDeleteById(id: string): Promise<IdentityDocument | null> {
    return await this.identityModel.findByIdAndUpdate(
      id,
      { status: 'deleted' },
      { new: true },
    );
  }

  async softDeleteByFilter(filter: any): Promise<IdentityDocument | null> {
    return await this.identityModel.findOneAndUpdate(filter, {
      status: 'deleted',
    });
  }

  async deleteById(id: string): Promise<IdentityDocument | null> {
    return await this.identityModel.findByIdAndDelete(id);
  }

  async deleteByFilter(filter: any): Promise<IdentityDocument | null> {
    return await this.identityModel.findOneAndDelete(filter);
  }
}
