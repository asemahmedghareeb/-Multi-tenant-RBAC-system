import { Inject } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../repositories/base-repository';

export const getRepositoryToken = (entity: Function): string =>
  `${entity.name}Repository`;

export const InjectRepository = (entity: Function): ParameterDecorator =>
  Inject(getRepositoryToken(entity));

export const createRepositoryProvider = (entity: Function) => {
  const repositoryClass = class extends BaseRepository<any> {
    constructor(model: Model<any>) {
      super(model);
    }
  };

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

export const createRepositoryProviders = (entities: Function[]) =>
  entities.map(createRepositoryProvider);
