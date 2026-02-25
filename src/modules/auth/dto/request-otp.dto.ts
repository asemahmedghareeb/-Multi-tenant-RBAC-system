import { IsEmail, IsNotEmpty, Validate } from 'class-validator';

export class RequestOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
