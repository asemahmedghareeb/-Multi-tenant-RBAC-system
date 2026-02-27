import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CheckUserHasPermissionDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  permissionId: string;
}
