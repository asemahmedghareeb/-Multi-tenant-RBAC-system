import {
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class AddRoleDto {
    @MaxLength(20, { message: 'messages.invalidNameLength' })
    @MinLength(3, { message: 'messages.invalidNameLength' })
    @IsString({ message: 'messages.invalidName' })
    @IsNotEmpty({ message: 'messages.nameRequired' })
    nameAr: string;

    @MaxLength(20, { message: 'messages.invalidNameLength' })
    @MinLength(3, { message: 'messages.invalidNameLength' })
    @IsString({ message: 'messages.invalidName' })
    @IsNotEmpty({ message: 'messages.nameRequired' })
    nameEn: string;

    @IsArray({ message: 'messages.invalidPermissions' })
    @IsString({ each: true, message: 'messages.invalidPermission' })
    @IsNotEmpty({ message: 'messages.permissionsRequired' })
    @IsOptional()
    permissions?: string[];
}
