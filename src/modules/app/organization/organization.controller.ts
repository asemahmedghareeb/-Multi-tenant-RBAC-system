import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { Auth } from '../auth-base/auth/decorators/auth.decorator';
import { UserType } from '../auth-base/auth/enums/user-type.enum';
import { CurrentUser } from '../auth-base/auth/decorators/current-user.decorator';
import { UpgradeSubscriptionDto } from './dto/upgrade-subscription.dto';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Auth({ roles: [UserType.ORGANIZATION] })
  @Patch()
  async upgradeSubscription(
    @Body() upgradeSubscriptionDto: UpgradeSubscriptionDto,
    @CurrentUser() identity: any,
  ) {
    return this.organizationService.upgradeSubscription(
      upgradeSubscriptionDto,
      identity,
    );
  }
}
