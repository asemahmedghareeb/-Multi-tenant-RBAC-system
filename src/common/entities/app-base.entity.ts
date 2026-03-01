import { Prop } from '@nestjs/mongoose';
import { Document, SchemaOptions } from 'mongoose';

export const SCHEMA_OPTIONS: SchemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
};

export class AppBaseEntity extends Document {
  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;

  @Prop({ default: false })
  isDeleted?: boolean;

  static get permissionsTarget(): string {
    return this.name.toLowerCase();
  }
}
