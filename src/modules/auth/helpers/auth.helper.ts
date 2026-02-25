import { ITokenPayload } from '../interfaces/token-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UserTokensService } from 'src/modules/user-tokens/user-tokens.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthHelper {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userTokensService: UserTokensService,
  ) {}

  async newToken(payload: ITokenPayload) {
    const token = await this.jwtService.signAsync(payload);

    await this.userTokensService.create({ user: payload.id, token });

    return token;
  }

  async deleteAllUserTokens(userId: string) {
    await this.userTokensService.deleteMany({ user: userId });
  }
}
