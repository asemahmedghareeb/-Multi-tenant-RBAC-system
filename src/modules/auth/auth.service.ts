import { OtpUtil } from './../../common/utils/otp-util';
import { Organization } from './../organization/entities/organization.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyReason } from './enums/otp-verify-reason.enum';
import { ResetPasswordDto } from './dto/reset-password';
import { RequestOtpDto } from './dto/request-otp.dto';

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
      id: identitySaved._id.toString(),
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

  async verifyOtp(data: VerifyOtpDto) {
    const user = await this.identityModel.findOne({ email: data.email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.otp !== data.otp) {
      throw new BadRequestException('Invalid OTP');
    }
    const validOtp = OtpUtil.verifyOtp(data.otp, user.otp!, user.otpExpireAt!);

    if (!validOtp) {
      throw new BadRequestException('expired OTP');
    }

    if (data.reason === VerifyReason.VERIFY) {
      user.isVerified = true;
      user.expireAt = undefined;
    } else if (data.reason === VerifyReason.RESET) {
      user.canResetPassword = true;
    }

    user.otp = undefined;
    user.otpExpireAt = undefined;

    await user.save();
  }

  async resetPassword(data: ResetPasswordDto) {
    const user = (await this.identityModel.findOne({
      email: data.email,
    })) as IdentityDocument;

    if (!user) throw new NotFoundException('User not found');

    if (!user.canResetPassword)
      throw new BadRequestException('Password reset not allowed');

    // Use comparePassword method to check if new password matches old password
    const isSamePassword = await user.comparePassword(data.newPassword);

    if (isSamePassword)
      throw new BadRequestException(
        'New password cannot be the same as old password',
      );

    user.password = data.newPassword;
    user.canResetPassword = false;

    await user.save();

    await this.authHelper.deleteAllUserTokens(user._id.toString());
  }

  async requestOtp(data: RequestOtpDto) {
    const user = await this.identityModel.findOne({
      $or: [{ email: data.email }],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = OtpUtil.generateOtp();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpireAt = otpExpireAt;
    await user.save();
    await this.mailerService.sendEmail(
      data.email,
      'OTP Request',
      `<p>Your OTP is: <b>${otp}</b>. It will expire in 10 minutes.</p>`,
    );
  }
}
