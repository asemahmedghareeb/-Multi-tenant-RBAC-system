import { DefaultPermissionActionsEnum } from '../enums/default-permissions.enum';
import { PermissionEnumType } from '../types/enum.type';

const PERMISSION_ENTITIES_REGISTRY: Array<{
  entity: any;
  permissionEnum: PermissionEnumType;
}> = [];

export function GeneratePermissions(permissionEnum?: PermissionEnumType) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    const enumToUse = permissionEnum || DefaultPermissionActionsEnum;

    PERMISSION_ENTITIES_REGISTRY.push({
      entity: constructor,
      permissionEnum: enumToUse,
    });

    Object.defineProperty(constructor, 'permissionActionsEnum', {
      get: function () {
        return enumToUse;
      },
    });

    return constructor;
  };
}

export function getRegisteredPermissionEntities() {
  return PERMISSION_ENTITIES_REGISTRY;
}
