import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserTokensService } from '../../user-tokens/user-tokens.service';
import { ITokenPayload } from '../interfaces/token-payload.interface';
import { AuthValidationService } from './auth-validation.service';

@Injectable()
export class AuthHelper {
  private readonly ACCESS_TOKEN_EXPIRY = '7d';
  private readonly REFRESH_TOKEN_EXPIRY = '30d';

  constructor(
    private readonly jwtService: JwtService,
    private readonly userTokensService: UserTokensService,
    private readonly authValidationService: AuthValidationService,
  ) {}

  async generateTokenPair(payload: ITokenPayload) {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    await this.userTokensService.createTokenPair({
      user: payload.id,
      accessToken,
      refreshToken,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async newToken(payload: ITokenPayload) {
    const token = await this.jwtService.signAsync(payload);

    await this.userTokensService.create({
      user: payload.id,
      token,
    });

    return token;
  }

  async deleteAllUserTokens(userId: string) {
    await this.userTokensService.deleteMany({ user: userId });
  }

  async validateRefreshTokenAndGetUser(refreshToken: string): Promise<any> {
    return await this.authValidationService.validateRefreshToken(refreshToken);
  }

  async generateAccessToken(
    payload: ITokenPayload,
    userId: string,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    await this.userTokensService.updateAccessToken(userId, accessToken);

    return {
      accessToken,
    };
  }
}
