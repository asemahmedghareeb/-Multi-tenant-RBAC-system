import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GetRoleDto {
    @IsMongoId({ message: 'messages.invalidId' })
    @IsNotEmpty({ message: 'messages.idRequired' })
    id: string;
}
