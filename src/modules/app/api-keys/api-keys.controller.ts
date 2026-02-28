import { Controller, Get, Post, Param, Delete, Query } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth } from '../auth-base/auth/decorators/auth.decorator';
import { CurrentUser } from '../auth-base/auth/decorators/current-user.decorator';
import { UserType } from '../auth-base/auth/enums/user-type.enum';
import { Identity } from '../auth-base/identities/entities/identity.entity';

@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @Auth({ validateToken: true, roles: [UserType.ORGANIZATION] })
  create(@CurrentUser() identity: Identity) {
    return this.apiKeysService.create(identity);
  }

  @Get()
  @Auth({ validateToken: true, roles: [UserType.ORGANIZATION] })
  findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() identity: Identity,
  ) {
    return this.apiKeysService.findAll(paginationDto, identity);
  }

  @Get(':id')
  @Auth({ validateToken: true, roles: [UserType.ORGANIZATION] })
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.apiKeysService.findOne(id);
  }

  @Delete(':id')
  @Auth({ validateToken: true, roles: [UserType.ORGANIZATION] })
  remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser() identity: Identity,
  ) {
    return this.apiKeysService.remove(id, identity);
  }
}
