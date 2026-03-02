import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AssignRoleToUserDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  roleId: string;
}
