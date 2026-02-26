import { IsArray, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AddOrRemovePermissionsDto {
    @IsMongoId({ message: 'messages.invalidId' })
    @IsNotEmpty({ message: 'messages.idRequired' })
    id: string;

    @IsArray({ message: 'messages.invalidPermissions' })
    @IsString({ each: true, message: 'messages.invalidPermission' })
    @IsNotEmpty({ message: 'messages.permissionsRequired' })
    permissions: string[];
}
