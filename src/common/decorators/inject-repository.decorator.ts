import { Inject } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../repositories/base-repository';

/**
 * Returns the DI token used to identify a repository for a given entity.
 * e.g. Organization → "OrganizationRepository"
 */
export const getRepositoryToken = (entity: Function): string =>
  `${entity.name}Repository`;

/**
 * Parameter decorator that injects the repository instance for the given entity.
 *
 * Usage:
 *   @InjectRepository(Organization)
 *   private readonly organizationRepository: BaseRepository<OrganizationDocument>
 */
export const InjectRepository = (entity: Function): ParameterDecorator =>
  Inject(getRepositoryToken(entity));

/**
 * Creates a NestJS provider that:
 *  1. Dynamically creates a subclass:
 *       class OrganizationRepository extends BaseRepository {
 *         constructor(model) { super(model); }
 *       }
 *  2. Instantiates it with the Mongoose model injected from DI
 *  3. Registers it under the "OrganizationRepository" token
 *
 * Register in your module's `providers` array:
 *   providers: [MyService, createRepositoryProvider(Organization)]
 *
 * The entity's Mongoose model must already be registered via MongooseModule.forFeature.
 */
export const createRepositoryProvider = (entity: Function) => {
  // Dynamically declare a named subclass that extends BaseRepository
  const repositoryClass = class extends BaseRepository<any> {
    constructor(model: Model<any>) {
      super(model);
    }
  };

  // Assign a meaningful name for debugging / stack traces
  Object.defineProperty(repositoryClass, 'name', {
    value: `${entity.name}Repository`,
  });

  return {
    provide: getRepositoryToken(entity),
    useFactory: (model: Model<any>): BaseRepository<any> =>
      new repositoryClass(model),
    inject: [getModelToken(entity.name)],
  };
};

/**
 * Creates repository providers for multiple entities at once.
 * Returns an array ready to be spread into `providers` (and `exports`).
 *
 * Usage:
 *   providers: [MyService, ...createRepositoryProviders([Organization, User])]
 */
export const createRepositoryProviders = (entities: Function[]) =>
  entities.map(createRepositoryProvider);
