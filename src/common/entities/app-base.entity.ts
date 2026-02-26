import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Base entity class for all Mongoose schemas
 * Provides common fields and the permissionsTarget property
 */
@Schema({ timestamps: true })
export abstract class AppBaseEntity extends Document {
  /**
   * Automatically managed by Mongoose
   */
  createdAt?: Date;

  /**
   * Automatically managed by Mongoose
   */
  updatedAt?: Date;

  deletedAt?: Date;

  /**
   * Returns the entity name in lowercase for permission targeting
   * Override this in child classes if you need a custom target name
   */
  static get permissionsTarget(): string {
    return this.name.toLowerCase();
  }
}
