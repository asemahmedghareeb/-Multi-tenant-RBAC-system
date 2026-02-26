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


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Auth()
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() currentUser: Identity,
  ) {
    return this.usersService.create(createUserDto, currentUser);
  }

  @Auth()
  @Get()
  findPaginated(@Query() paginationDto: PaginationDto) {
    return this.usersService.find(paginationDto);
  }

  @Auth()
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Auth()
  @Delete(':id')
  deleteOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.delete(id);
  }

  @Auth()
  @Patch('block/:id')
  blockUser(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.blockORUnblockUser(id);
  }
}
