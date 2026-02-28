import { Controller, Get, Post, Param, Delete, Query } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth } from '../auth-base/auth/decorators/auth.decorator';
import { CurrentUser } from '../auth-base/auth/decorators/current-user.decorator';
import { UserType } from '../auth-base/auth/enums/user-type.enum';
import { Identity } from '../auth-base/identities/entities/identity.entity';
import { ApiUtil } from 'src/common/utils/response-util';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @Auth({ validateToken: true, roles: [UserType.ORGANIZATION] })
  async create(@CurrentUser() identity: Identity) {
    const result = await this.apiKeysService.create(identity);
    return ApiUtil.formatResponse(201, ResponseMessageEnum.SUCCESS, result);
  }

  @Get()
  @Auth({ validateToken: true, roles: [UserType.ORGANIZATION] })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() identity: Identity,
  ) {
    const result = await this.apiKeysService.findAll(paginationDto, identity);

    const { items, pageInfo } = result;
    return ApiUtil.formatResponse(
      200,
      ResponseMessageEnum.SUCCESS,
      items,
      pageInfo,
    );
  }

  @Get(':id')
  @Auth({ validateToken: true, roles: [UserType.ORGANIZATION] })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const result = await this.apiKeysService.findOne(id);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS, result);
  }

  @Delete(':id')
  @Auth({  roles: [UserType.ORGANIZATION] })
  async remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() identity: Identity,
  ) {
    const result = await this.apiKeysService.remove(id, identity);
    return ApiUtil.formatResponse(200, ResponseMessageEnum.SUCCESS);
  }
}
