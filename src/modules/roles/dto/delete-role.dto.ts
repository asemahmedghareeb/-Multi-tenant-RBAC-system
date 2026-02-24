import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteRoleDto {
    @IsMongoId({ message: 'messages.invalidId' })
    @IsNotEmpty({ message: 'messages.idRequired' })
    id: string;
}
