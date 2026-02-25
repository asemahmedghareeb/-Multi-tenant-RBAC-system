import { PaginationDto } from './dto/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { User, UserDocument } from './entities/user.entity';
import {
  Identity,
  IdentityDocument,
} from '../identities/entities/identity.entity';
import { Transactional } from 'src/common/decorators/transactional.decorator';

@Injectable()
export class UsersService extends BaseRepository<UserDocument> {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Identity.name)
    private readonly identityModel: Model<IdentityDocument>,
  ) {
    super(userModel);
  }

  @Transactional()
  async create(createUserDto: CreateUserDto) {
    const { email, password, username } = createUserDto;

    const existingIdentity = await this.identityModel.findOne({ email });

    if (existingIdentity) {
      throw new ConflictException('Email already exists');
    }

    const identity = new this.identityModel({
      email,
      password,
    });

    const identitySaved = await identity.save();

    return await this.createOne({ username, identity: identitySaved });
  }

  async find(PaginationDto: PaginationDto) {
    return await this.findPaginated(
      {},
      { createdAt: -1 },
      PaginationDto.page,
      PaginationDto.limit,
      { path: 'identity', select: '-password -__v' },
    );
  }

  async findOne(id: string) {
    return await this.findOneOrFail({ _id: id }, 'User not found', {
      path: 'identity',
      select: '-password -__v',
    });
  }

  @Transactional()
  async deleteOne(id: string) {
    const user = await this.findOneOrFail({ _id: id }, 'User not found');

    await this.identityModel.deleteOne({ _id: user.identity }).exec();
    return await this.userModel.deleteOne({ _id: id }).exec();
  }
}
