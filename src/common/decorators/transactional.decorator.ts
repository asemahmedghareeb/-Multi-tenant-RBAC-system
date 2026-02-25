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
        if (
          this[key] &&
          this[key].db &&
          typeof this[key].db.transaction === 'function'
        ) {
          connection = this[key].db;
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
