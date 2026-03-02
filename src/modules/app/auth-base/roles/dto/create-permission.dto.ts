import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  resource: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  arName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  enName?: string;
}
