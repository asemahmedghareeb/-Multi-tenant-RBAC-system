import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { User, UserDocument } from './entities/user.entity';
import { Transactional } from 'src/common/decorators/transactional.decorator';
import { UserType } from '../auth-base/auth/enums/user-type.enum';
import {
  Identity,
  IdentityDocument,
} from '../auth-base/identities/entities/identity.entity';
import { IdentityStatus } from '../auth-base/identities/enums/identity-status.enum';
import { ErrorMessageEnum } from 'src/common/enums/error-message.enum';
import { ReturnObject } from 'src/common/return-object/return-object';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Identity)
    private readonly identityRepository: BaseRepository<IdentityDocument>,
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<UserDocument>,
    private readonly returnObject: ReturnObject,
  ) {}

  @Transactional()
  async create(createUserDto: CreateUserDto, currentUser: any) {
    const { email, username } = createUserDto;

    const organization = currentUser.organization;

    await this.userRepository.findOneAndFail(
      {
        email,
        organization: organization._id,
      },
      ErrorMessageEnum.USER_ALREADY_EXIST,
    );

    const user = await this.userRepository.createOne({
      username,
      email,
      organization: organization._id,
    });
    return this.returnObject.user(user);
  }

  async find(PaginationDto: PaginationDto, currentUser: any) {
    const users = await this.userRepository.findPaginated(
      { organization: currentUser.organization._id },
      { createdAt: -1 },
      PaginationDto.page,
      PaginationDto.limit,
    );
    return {
      items: users.items.map((user) => {
        return this.returnObject.user(user);
      }),
      pageInfo: users.pageInfo,
    };
  
  }

  async findOne(id: string, identity: any) {
    const user = await this.userRepository.findOneOrFail(
      { _id: id, organization: identity.organization._id },
      ErrorMessageEnum.NOT_FOUND,
    );

    return this.returnObject.user(user);
  }

  @Transactional()
  async delete(id: string, identity: any) {
    const user = await this.userRepository.findOneOrFail(
      { _id: id, organization: identity.organization._id },
      ErrorMessageEnum.FORBIDDEN,
    );

    await this.userRepository.deleteOne({ _id: id });
    return true;
  }

  @Transactional()
  async blockORUnblockUser(id: string, identity: any) {
    const user = await this.userRepository.findOneOrFail(
      { _id: id, organization: identity.organization._id },
      ErrorMessageEnum.NOT_FOUND,
    );

    user.isBlocked = !user.isBlocked;
    await user.save();

    return true;
  }
}
