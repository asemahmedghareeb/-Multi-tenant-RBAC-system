import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserTokensService } from '../../user-tokens/user-tokens.service';
import { ITokenPayload } from '../interfaces/token-payload.interface';
import { AuthValidationService } from './auth-validation.service';

/**
 * AuthHelper - Token generation and management utility
 *
 * Generates and stores JWT tokens with support for:
 * - Access tokens (short-lived, 7 days)
 * - Refresh tokens (long-lived, 30 days)
 * Both tokens are stored together in a single UserToken document
 */
@Injectable()
export class AuthHelper {
  // Token expiration times based on type
  private readonly ACCESS_TOKEN_EXPIRY = '7d';
  private readonly REFRESH_TOKEN_EXPIRY = '30d';

  constructor(
    private readonly jwtService: JwtService,
    private readonly userTokensService: UserTokensService,
    private readonly authValidationService: AuthValidationService,
  ) {}

  /**
   * Generate both access and refresh tokens
   * Creates paired tokens and stores them together in a single document
   *
   * @param payload Token payload containing user information
   * @returns Object containing both accessToken and refreshToken
   */
  async generateTokenPair(payload: ITokenPayload) {
    // Generate access token (7 days)
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    // Generate refresh token (30 days)
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    });

    // Store both tokens in single document
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

  /**
   * Legacy method - Generate a single token for backward compatibility
   * @deprecated Use generateTokenPair instead for new implementations
   *
   * @param payload Token payload
   * @returns JWT token string
   */
  async newToken(payload: ITokenPayload) {
    const token = await this.jwtService.signAsync(payload);

    await this.userTokensService.create({
      user: payload.id,
      token,
    });

    return token;
  }

  /**
   * Delete all tokens for a user (logout from all devices)
   */
  async deleteAllUserTokens(userId: string) {
    await this.userTokensService.deleteMany({ user: userId });
  }

  /**
   * Validate refresh token and return user identity
   * Used when refreshing access tokens
   */
  async validateRefreshTokenAndGetUser(refreshToken: string): Promise<any> {
    return await this.authValidationService.validateRefreshToken(refreshToken);
  }

  /**
   * Generate only a new access token (for refresh token flow)
   * Keeps the refresh token unchanged
   *
   * @param payload Token payload containing user information
   * @param userId User ID to update the token for
   * @returns Object containing only the new accessToken
   */
  async generateAccessToken(
    payload: ITokenPayload,
    userId: string,
  ): Promise<{ accessToken: string }> {
    // Generate new access token only (7 days)
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    });

    // Update only the access token in database, keeping refresh token intact
    await this.userTokensService.updateAccessToken(userId, accessToken);

    return {
      accessToken,
    };
  }
}
