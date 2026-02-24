import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from './entities/permission.entity';
import { getRegisteredPermissionEntities } from 'src/common/decorators/generate-permissions.decorator';

@Injectable()
export class PermissionsService implements OnModuleInit {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
  ) {}

  async onModuleInit() {
    await this.generatePermissions();
    this.logger.log('Permission generation completed');
  }

  /**
   * Generate permissions for all entities decorated with @GeneratePermissions
   */
  async generatePermissions(): Promise<void> {
    const permissionsToCreate: Array<{ resource: string; action: string }> = [];

    // Get all entities dynamically from the registry
    const registeredEntities = getRegisteredPermissionEntities();

    for (const { entity, permissionEnum } of registeredEntities) {
      const entityName = entity.name;

      // Convert entity name to lowercase resource name (e.g., User -> user)
      const resourceName = entityName.toLowerCase();

      // Generate permissions for each action in the enum
      for (const action of Object.values(permissionEnum)) {
        permissionsToCreate.push({
          resource: resourceName,
          action: action as string,
        });
      }
    }

    // Get all existing permissions from database
    const existingPermissions = await this.permissionModel.find().exec();

    // Create a Set of current valid permission keys for quick lookup
    const validPermissionKeys = new Set(
      permissionsToCreate.map((p) => `${p.resource}:${p.action}`),
    );

    // Find permissions to delete (exist in DB but not in current entities)
    const permissionsToDelete = existingPermissions.filter(
      (p) => !validPermissionKeys.has(`${p.resource}:${p.action}`),
    );

    // Delete obsolete permissions
    if (permissionsToDelete.length > 0) {
      const deleteIds = permissionsToDelete.map((p) => (p as any)._id);
      await this.permissionModel.deleteMany({ _id: { $in: deleteIds } });

      this.logger.warn(
        `Removed ${permissionsToDelete.length} obsolete permissions:`,
      );

    } else {
      this.logger.log('No obsolete permissions found');
    }

    // Bulk insert/update permissions using a single database operation
    if (permissionsToCreate.length > 0) {
      const bulkOps = permissionsToCreate.map((permission) => {
        const permissionName = `${permission.resource}:${permission.action}`;
        return {
          updateOne: {
            filter: {
              resource: permission.resource,
              action: permission.action,
            },
            update: {
              $setOnInsert: {
                resource: permission.resource,
                action: permission.action,
                arName: permissionName,
                enName: permissionName,
              },
            },
            upsert: true,
          },
        };
      });

      const result = await this.permissionModel.bulkWrite(bulkOps);
      
      this.logger.log(
        `Permissions created: ${result.upsertedCount}, already existed: ${permissionsToCreate.length - result.upsertedCount}`,
      ); 
    }

    this.logger.log(
      `Total permissions processed: ${permissionsToCreate.length}`,
    );
  }

  /**
   * Get all permissions
   */
  async findAll(): Promise<Permission[]> {
    return this.permissionModel.find().exec();
  }

  /**
   * Get permissions by resource
   */
  async findByResource(resource: string): Promise<Permission[]> {
    return this.permissionModel.find({ resource }).exec();
  }

  /**
   * Get a specific permission
   */
  async findOne(resource: string, action: string): Promise<Permission | null> {
    return this.permissionModel.findOne({ resource, action }).exec();
  }
}
