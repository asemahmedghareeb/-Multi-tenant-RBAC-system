import { Injectable, BadRequestException } from '@nestjs/common';
import { Transactional } from 'src/common/decorators/transactional.decorator';
import { BaseRepository } from 'src/common/repositories/base-repository';
import { OtpUtil } from 'src/common/utils/otp-util';
import { MailService } from 'src/modules/core/mailer/mail.service';
import { ApiKey } from '../../api-keys/entities/api-key.entity';
import { SubscriptionTiers } from '../../api-keys/enums/subscription-tiers.enum';
import { ApiKeyGeneratorHelper } from '../../api-keys/helpers/api-key-generator.helper';
import {
  IdentityDocument,
  Identity,
} from '../identities/entities/identity.entity';
import { Organization } from '../../organization/entities/organization.entity';
import { OrganizationSignInDto } from './dto/organization-signin.dto';
import { OrganizationSignupDto } from './dto/organization-signup.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { ResetPasswordDto } from './dto/reset-password';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyReason } from './enums/otp-verify-reason.enum';
import { AuthHelper } from './helpers/auth.helper';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Identity)
    private readonly identityRepository: BaseRepository<IdentityDocument>,
    @InjectRepository(Organization)
    private readonly organizationRepository: BaseRepository<Organization>,
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: BaseRepository<ApiKey>,
    private readonly authHelper: AuthHelper,
    private readonly mailerService: MailService,
    private readonly apiKeyGeneratorHelper: ApiKeyGeneratorHelper,
  ) {}

  @Transactional()
  async signUp(data: OrganizationSignupDto) {
    const { email, password, name } = data;

    await this.identityRepository.findOneAndFail({ email });

    const otp = OtpUtil.generateOtp();
    const otpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    const identity = await this.identityRepository.createOne({
      email,
      password,
      otp,
      otpExpireAt,
    });

    const identitySaved = await identity.save();

    const organization = await this.organizationRepository.createOne({
      identity: identitySaved._id.toString(),
      name,
    });

    await this.mailerService.sendEmail(
      email,
      'OTP for Organization Signup',
      `<p>Your OTP for organization signup is: <b>${otp}</b>. It will expire in 10 minutes.</p>`,
    );

    const token = await this.authHelper.newToken({
      id: identitySaved._id.toString(),
      userType: identitySaved.type,
    });

    const apiKey = await this.apiKeyRepository.createOne({
      organization: organization._id.toString(),
      key: this.apiKeyGeneratorHelper.generateApiKey(),
      tier: SubscriptionTiers.FREE,
    });

    await apiKey.save();

    return {
      token,
      apiKey: apiKey.key,
    };
  }

  @Transactional()
  async signIn(data: OrganizationSignInDto) {
    const { email, password } = data;

    const identity = await this.identityRepository.findOneOrFail({ email });

    if (!identity.isVerified) {
      throw new BadRequestException('Email not verified');
    }
    const isPasswordValid = await identity.comparePassword(password);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = await this.authHelper.newToken({
      id: identity._id.toString(),
      userType: identity.type,
    });
    return { token };
  }

  @Transactional()
  async verifyOtp(data: VerifyOtpDto) {
    const user = await this.identityRepository.findOneOrFail({
      email: data.email,
    });

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

  @Transactional()
  async resetPassword(data: ResetPasswordDto) {
    const user = await this.identityRepository.findOneOrFail({
      email: data.email,
    });

    if (!user.canResetPassword)
      throw new BadRequestException('Password reset not allowed');

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

  @Transactional()
  async requestOtp(data: RequestOtpDto) {
    const user = await this.identityRepository.findOneOrFail({
      email: data.email,
    });

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
