import {
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateRoleDto {
    @IsMongoId({ message: 'messages.invalidId' })
    @IsNotEmpty({ message: 'messages.idRequired' })
    id: string;

    @MaxLength(20, { message: 'messages.invalidNameLength' })
    @MinLength(3, { message: 'messages.invalidNameLength' })
    @IsString({ message: 'messages.invalidName' })
    @IsNotEmpty({ message: 'messages.nameRequired' })
    @IsOptional()
    nameAr?: string;

    @MaxLength(20, { message: 'messages.invalidNameLength' })
    @MinLength(3, { message: 'messages.invalidNameLength' })
    @IsString({ message: 'messages.invalidName' })
    @IsNotEmpty({ message: 'messages.nameRequired' })
    @IsOptional()
    nameEn?: string;
}
