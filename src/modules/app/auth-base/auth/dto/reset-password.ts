import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MaxLength(20)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}
