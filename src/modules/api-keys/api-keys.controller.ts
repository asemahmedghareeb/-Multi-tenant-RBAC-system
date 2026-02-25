import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Identity } from '../identities/entities/identity.entity';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserType } from '../auth/enums/user-type.enum';
import { PaginationDto } from '../users/dto/pagination.dto';

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
  findOne(@Param('id') id: string) {
    return this.apiKeysService.findOne(id);
  }

  @Delete(':id')
  @Auth({ validateToken: true, roles: [UserType.ORGANIZATION] })
  remove(@Param('id') id: string, @CurrentUser() identity: Identity) {
    return this.apiKeysService.remove(id, identity);
  }
}
