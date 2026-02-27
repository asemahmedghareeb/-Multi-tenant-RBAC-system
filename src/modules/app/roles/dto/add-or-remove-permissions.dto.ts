import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AddOrRemovePermissionsDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  permissions: string[];
}
