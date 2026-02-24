import { OtpUtil } from './../../common/utils/otp-util';
import { Organization } from './../organization/entities/organization.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ConflictException, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  Identity,
  IdentityDocument,
} from '../identities/entities/identity.entity';
import { Transactional } from 'src/common/decorators/transactional.decorator';
import { OrganizationSignupDto } from './dto/organization-signup.dto';
import { AuthHelper } from './helpers/auth.helper';
import { MailService } from '../mailer/mail.service';
import { ApiKey } from '../api-keys/entities/api-key.entity';
import { SubscriptionTiers } from '../api-keys/enums/subscribtion-tiers.enum';
import { ApiKeyGeneratorHelper } from '../api-keys/helpers/api-key-generator.helper';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Identity.name)
    private readonly identityModel: Model<IdentityDocument>,
    @InjectModel(Organization.name)
    private readonly organizationModel: Model<Organization>,
    @InjectModel(ApiKey.name)
    private readonly apiKeyModel: Model<ApiKey>,
    private readonly authHelper: AuthHelper,
    private readonly mailerService: MailService,
    private readonly apiKeyGeneratorHelper: ApiKeyGeneratorHelper,
  ) {}

  @Transactional()
  async signUp(data: OrganizationSignupDto) {
    const { email, password, name } = data;

    const existingIdentity = await this.identityModel.findOne({
      $or: [{ email }],
    });

    if (existingIdentity) {
      throw new ConflictException('Email or  already exists');
    }

    const otp = OtpUtil.generateOtp();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    const identity = new this.identityModel({
      email,
      password,
      otp,
      otpExpireAt,

    });

    const identitySaved = await identity.save();

    const organization = new this.organizationModel({
      identity: identitySaved._id,
      name,
    });

    await organization.save();

    await this.mailerService.sendEmail(
      email,
      'OTP for Organization Signup',
      `<p>Your OTP for organization signup is: <b>${otp}</b>. It will expire in 10 minutes.</p>`,
    );

    const token = await this.authHelper.newToken({
      id: identitySaved.id,
      userType: identitySaved.type,
    });

    const apiKey = new this.apiKeyModel({
      organization: organization._id,
      key: this.apiKeyGeneratorHelper.generateApiKey(),
      tier: SubscriptionTiers.FREE,
    });

    await apiKey.save();

    return {
      token,
      apiKey: apiKey.key,
      message:
        'Organization registered successfully. Please verify your email with the OTP sent.',
    };
  }
}


