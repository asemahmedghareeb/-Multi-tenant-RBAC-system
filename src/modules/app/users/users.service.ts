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
import { ErrorCodeEnum } from 'src/common/enums/error-code.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Identity)
    private readonly identityRepository: BaseRepository<IdentityDocument>,
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<UserDocument>,
  ) {}

  @Transactional()
  async create(createUserDto: CreateUserDto, currentUser: any) {
    const { email, password, username } = createUserDto;

    const organization = currentUser.organization;

    await this.identityRepository.findOneAndFail({ email });

    const identity = await this.identityRepository.createOne({
      email,
      password,
      isVerified: true,
      type: UserType.USER,
    });

    return await this.userRepository.createOne({
      username,
      identity: identity,
      organization,
    });
  }

  async find(PaginationDto: PaginationDto) {
    return await this.userRepository.findPaginated(
      {},
      { createdAt: -1 },
      PaginationDto.page,
      PaginationDto.limit,
      {
        populate: {
          path: 'identity',
          select: '-password -__v',
        },
        lean: true,
      },
    );
  }

  async findOne(id: string) {
    return await this.userRepository.findOneOrFail(
      { _id: id },
      ErrorCodeEnum.NOT_FOUND,
      {
        populate: {
          path: 'identity',
          select: '-password -__v',
        },
        lean: true,
      },
    );
  }

  @Transactional()
  async delete(id: string) {
    const user = await this.userRepository.findOneOrFail({ _id: id });

    await this.identityRepository.deleteOne({ _id: user.identity });
    await this.userRepository.deleteOne({ _id: id });
    return true;
  }

  @Transactional()
  async blockORUnblockUser(id: string) {
    const user = await this.userRepository.findOneOrFail(
      { _id: id },
      ErrorCodeEnum.NOT_FOUND,
      {
        populate: {
          path: 'identity',
        },
      },
    );

    const status = (user.identity as Identity).status;
    if (status === IdentityStatus.BLOCKED) {
      (user.identity as Identity).status = IdentityStatus.ACTIVE;
    } else {
      (user.identity as Identity).status = IdentityStatus.BLOCKED;
    }

    await (user.identity as Identity).save();

    return true;
  }
}
