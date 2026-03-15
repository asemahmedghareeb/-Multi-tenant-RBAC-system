import { IsString } from 'class-validator';

export class SignOutDto {
  @IsString()
  accessToken: string;
}
