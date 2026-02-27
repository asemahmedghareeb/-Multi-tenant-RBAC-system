import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';


export class AddRoleDto {
  @MaxLength(20)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  nameAr: string;

  @MaxLength(20)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  @IsOptional()
  permissions?: string[];
}
