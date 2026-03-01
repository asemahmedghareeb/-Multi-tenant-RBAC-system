import { ReturnObject } from 'src/common/return-object/return-object';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { Auth } from '../auth-base/auth/decorators/auth.decorator';
import { CurrentUser } from '../auth-base/auth/decorators/current-user.decorator';
import { Identity } from '../auth-base/identities/entities/identity.entity';
import { ApiUtil } from 'src/common/utils/response-util';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth()
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: Identity,
  ) {
    const result = await this.usersService.create(createUserDto, currentUser);
    return ApiUtil.formatResponse(201, ResponseMessageEnum.SUCCESS, result);
  }

  @Auth()
  @Get()
  async findPaginated(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() currentUser: Identity,
  ) {
    const { items, pageInfo } = await this.usersService.find(
      paginationDto,
      currentUser,
    );
    return ApiUtil.formatResponse(
      200,
      ResponseMessageEnum.SUCCESS,
      items,
      pageInfo,
    );
  }

  @Auth()
  @Get(':id')
  async findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() currentUser: Identity,
  ) {
    const result = await this.usersService.findOne(id, currentUser);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, result);
  }

  @Auth()
  @Delete(':id')
  async deleteOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() currentUser: Identity,
  ) {
    await this.usersService.delete(id, currentUser);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS);
  }

  @Auth()
  @Patch('block/:id')
  async blockUser(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() currentUser: Identity,
  ) {
    await this.usersService.blockORUnblockUser(id, currentUser);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS);
  }
}
