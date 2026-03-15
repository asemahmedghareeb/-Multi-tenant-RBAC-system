import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
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
import { UserTokensService } from '../user-tokens/user-tokens.service';
import { InjectRepository } from 'src/common/decorators/inject-repository.decorator';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorMessageEnum } from 'src/common/enums/error-message.enum';

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
    private readonly userTokensService: UserTokensService,
    private readonly mailerService: MailService,
    private readonly apiKeyGeneratorHelper: ApiKeyGeneratorHelper,
    private readonly i18nService: I18nService,
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
      this.i18nService.t('mail-subject.ORGANIZATION_SIGNUP_OTP'),
      `<p><b>${this.i18nService.t('messages.OTP_SIGNUP_MESSAGE', { args: { otp } })}</b></p>`,
    );

    const tokenData = await this.authHelper.generateTokenPair({
      id: identitySaved._id.toString(),
      userType: identitySaved.type,
    });

    const apiKey = await this.apiKeyRepository.createOne({
      organization: organization._id.toString(),
      key: this.apiKeyGeneratorHelper.generateApiKey(),
      tier: SubscriptionTiers.FREE,
    });

    return {
      ...tokenData,
      apiKey: apiKey.key,
    };
  }

  @Transactional()
  async signIn(data: OrganizationSignInDto) {
    const { email, password } = data;

    const identity = await this.identityRepository.findOneOrFail({ email });

    if (!identity.isVerified) {
      throw new AppHttpException(ErrorMessageEnum.USER_NOT_VERIFIED);
    }
    const isPasswordValid = await identity.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppHttpException(ErrorMessageEnum.WRONG_EMAIL_OR_PASSWORD);
    }

    const tokenData = await this.authHelper.generateTokenPair({
      id: identity._id.toString(),
      userType: identity.type,
    });
    return tokenData;
  }

  @Transactional()
  async verifyOtp(data: VerifyOtpDto) {
    const user = await this.identityRepository.findOneOrFail({
      email: data.email,
    });

    if (user.otp !== data.otp) {
      throw new AppHttpException(ErrorMessageEnum.INVALID_VERIFICATION_CODE);
    }
    const validOtp = OtpUtil.verifyOtp(data.otp, user.otp, user.otpExpireAt!);

    if (!validOtp) {
      throw new AppHttpException(ErrorMessageEnum.EXPIRED_VERIFICATION_CODE);
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
      throw new AppHttpException(ErrorMessageEnum.PASSWORD_RESET_NOT_ALLOWED);

    const isSamePassword = await user.comparePassword(data.newPassword);

    if (isSamePassword)
      throw new AppHttpException(ErrorMessageEnum.SAME_PASSWORD_ERROR);

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
      this.i18nService.t('mail-subject.OTP_REQUEST'),
      `<p>${this.i18nService.t('messages.OTP_REQUEST_MESSAGE', { args: { otp } })}</p>`,
    );
  }

  @Transactional()
  async refreshToken(refreshToken: string) {
    const identity =
      await this.authHelper.validateRefreshTokenAndGetUser(refreshToken);

    const tokenData = await this.authHelper.generateAccessToken(
      {
        id: identity._id.toString(),
        userType: identity.type,
      },
      identity._id.toString(),
    );

    return tokenData;
  }

  /**
   * Sign out from current device/session
   * Deletes the current access token
   */
  @Transactional()
  async signOut(userId: string, accessToken: string): Promise<boolean> {
    return await this.userTokensService.signOutFromDevice(userId, accessToken);
  }

  /**
   * Sign out from all devices/sessions
   * Deletes all tokens for the user
   */
  @Transactional()
  async signOutFromAllDevices(userId: string): Promise<boolean> {
    return await this.userTokensService.signOutFromAllDevices(userId);
  }
}
