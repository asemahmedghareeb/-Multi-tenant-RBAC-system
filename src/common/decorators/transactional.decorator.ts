import { Connection } from 'mongoose';

export function Transactional() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      let connection: Connection | undefined;

      for (const key in this) {
        const prop = this[key];
        if (!prop) continue;

        // Direct Mongoose Model injected
        if (prop.db && typeof prop.db.transaction === 'function') {
          connection = prop.db;
          break;
        }

        // BaseRepository wrapping a Mongoose Model
        if (
          prop.model &&
          prop.model.db &&
          typeof prop.model.db.transaction === 'function'
        ) {
          connection = prop.model.db;
          break;
        }
      }

      if (!connection) {
        throw new Error(
          `@Transactional() failed: Could not find a database connection in ${target.constructor.name}. Ensure at least one Mongoose Model is injected.`,
        );
      }

      return await connection.transaction(async () => {
        return await originalMethod.apply(this, args);
      });
    };

    return descriptor;
  };
}
