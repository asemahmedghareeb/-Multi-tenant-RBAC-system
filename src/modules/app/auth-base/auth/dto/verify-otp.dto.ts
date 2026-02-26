import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Validate,
} from 'class-validator';
import { VerifyReason } from '../enums/otp-verify-reason.enum';

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEnum(VerifyReason)
  @IsNotEmpty()
  reason: VerifyReason;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
