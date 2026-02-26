import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from '../services/roles.service';


@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}
}
