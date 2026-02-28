import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestOtpDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
