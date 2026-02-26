import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class OrganizationSignInDto {
  @ApiPropertyOptional({
    description: 'Email address of the organization',
    example: 'org@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the account (minimum 6 characters)',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
