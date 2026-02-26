import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupIdentityDto {
  @ApiPropertyOptional({
    description: 'Email address of the identity',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the identity',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Password for the account (minimum 6 characters)',
    example: 'password123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({
    description: 'Role ID for the identity',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  role?: string;
}
