import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Permission } from './permission.entity';
import { GeneratePermissions } from 'src/common/decorators/generate-permissions.decorator';
import { AppBaseEntity } from 'src/common/entities/app-base.entity';

@GeneratePermissions()
@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
})
export class Role extends AppBaseEntity {
    @Prop({
        type: {            _id: false,
            ar: String,
            en: String,
        },
    })
    name: {
        ar: string;
        en: string;
    };

    @Prop({ default: false })
    isSuperAdmin: boolean;


    @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Permission', default: [] })
    permissions: string[] | Permission[];
}

export type RoleDocument = Role;

export const RoleSchema = SchemaFactory.createForClass(Role);
