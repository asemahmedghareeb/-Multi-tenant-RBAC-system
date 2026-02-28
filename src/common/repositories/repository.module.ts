import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { createRepositoryProvider } from '../decorators/inject-repository.decorator';

export interface EntitySchema {
  entity: Function;
  schema: any;
}

export interface EntityDbModule extends DynamicModule {
  entity: Function;
}

/**
 * Replacement for raw MongooseModule.forFeature() in db module files.
 * Attaches the entity class onto the module so RepositoryModule can
 * infer it automatically — no need to pass entity names separately.
 *
 * Usage (in *.db.module.ts):
 *   export const usersDbModule = createDbModule(User, UserSchema);
 */
export const createDbModule = (
  entity: Function,
  schema: any,
): EntityDbModule => {
  const mod = MongooseModule.forFeature([
    { name: (entity as any).name, schema },
  ]) as EntityDbModule;
  mod.entity = entity;
  return mod;
};

@Module({})
export class RepositoryModule {
  /**
   * Registers Mongoose models and creates repository providers for the given entities.
   * Pass entity+schema pairs and the module handles MongooseModule.forFeature internally.
   */
  static forFeature(entitySchemas: EntitySchema[]): DynamicModule {
    const mongooseModule = MongooseModule.forFeature(
      entitySchemas.map(({ entity, schema }) => ({
        name: (entity as any).name,
        schema,
      })),
    );

    const repositoryProviders = entitySchemas.map(({ entity }) =>
      createRepositoryProvider(entity),
    );

    return {
      module: RepositoryModule,
      imports: [mongooseModule],
      providers: repositoryProviders,
      exports: repositoryProviders,
    };
  }

  /**
   * Accepts db modules created with createDbModule() and wires repository
   * providers automatically — no entity list needed.
   *
   * Usage:
   *   imports: [
   *     RepositoryModule.fromDbModules([usersDbModule, organizationDbModule])
   *   ]
   */
  static fromDbModules(dbModules: EntityDbModule[]): DynamicModule {
    const repositoryProviders = dbModules.map(({ entity }) =>
      createRepositoryProvider(entity),
    );

    return {
      module: RepositoryModule,
      imports: dbModules,
      providers: repositoryProviders,
      exports: repositoryProviders,
    };
  }
}
