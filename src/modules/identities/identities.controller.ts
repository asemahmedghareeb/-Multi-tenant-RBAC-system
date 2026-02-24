import { Controller, Post } from '@nestjs/common';
import { IdentitiesService } from './identities.service';
import { Identity } from './entities/identity.entity';

@Controller('identities')
export class IdentitiesController {
  constructor(private readonly identitiesService: IdentitiesService) {}
}
