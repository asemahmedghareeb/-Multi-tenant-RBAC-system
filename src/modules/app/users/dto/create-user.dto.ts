import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsMongoId()
  @IsNotEmpty()
  organization: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  //   @IsStrongPassword()
  password: string;
}
