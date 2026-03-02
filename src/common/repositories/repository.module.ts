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
