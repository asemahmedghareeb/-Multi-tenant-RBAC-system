import {
  Model,
  Document,
  UpdateQuery,
  PopulateOptions,
  SortOrder,
} from 'mongoose';
import { AppHttpException } from '../exceptions/app-http.exception';
import { ErrorMessageEnum } from '../enums/error-message.enum';

export interface QueryOptions {
  populate?: PopulateOptions | (string | PopulateOptions)[];
  lean?: boolean;
  select?: string | string[];
}

export class BaseRepository<T extends Document> {
  constructor(public readonly model: Model<T>) {}

  async findOne<R = T>(
    filter: Record<string, any>,
    options: QueryOptions = {},
    mapFn?: (item: T) => R,
  ): Promise<R | null> {
    let query = this.model.findOne(filter);
    const { populate, lean, select } = options;
    if (populate) query = query.populate(populate);
    if (lean) query.lean();
    if (select) query.select(select);
    const result = await query.exec();
    if (!result) return null;
    return mapFn ? mapFn(result) : (result as unknown as R);
  }

  async findOneOrFail(
    filter: Record<string, any>,
    errorMessage?: ErrorMessageEnum,
    options: QueryOptions = {},
    mapFn?: (item: T) => any,
  ): Promise<T> {
    let query = this.model.findOne(filter);
    const { populate, lean, select } = options;
    if (populate) query = query.populate(populate);
    if (lean) query.lean();
    if (select) query.select(select);
    const result = await query.exec();
    if (!result) {
      throw new AppHttpException(errorMessage || ErrorMessageEnum.NOT_FOUND);
    }
    return mapFn ? mapFn(result) : result;
  }

  async findOneAndFail(
    filter: Record<string, any>,
    errorMessage?: ErrorMessageEnum,
    options: QueryOptions = {},
  ): Promise<void> {
    const { populate, lean, select } = options;
    let query = this.model.findOne(filter);
    if (populate) query = query.populate(populate);
    if (lean) query.lean();
    if (select) query.select(select);
    const result = await query.exec();
    if (result) {
      throw new AppHttpException(
        errorMessage || ErrorMessageEnum.BAD_REQUEST_EXCEPTION,
      );
    }
  }

  async findPaginated<R = T>(
    filter: Record<string, any> = {},
    sort?: string | { [key: string]: SortOrder },
    page: number = 1,
    limit: number = 15,
    options: QueryOptions = {},
    mapFn?: (item: T) => R,
  ) {
    const skip = (page - 1) * limit;
    const { populate, lean, select } = options;

    const query = this.model.find(filter).skip(skip).limit(limit);

    if (sort) query.sort(sort);
    if (populate) query.populate(populate);
    if (select) query.select(select);
    if (lean) query.lean();

    const [items, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const pagesCount = Math.ceil(total / limit);

    return {
      items: mapFn ? items.map(mapFn) : items,
      pageInfo: {
        limit,
        page,
        hasPrevious: page > 1,
        hasNext: skip + limit < total,
        totalCount: total,
        pagesCount,
      },
    };
  }

  async updateMany(
    filter: Record<string, any>,
    update: UpdateQuery<T>,
  ): Promise<T[]> {
    const entities = await this.model.find(filter).exec();
    for (const entity of entities) {
      Object.assign(entity, update);
      await entity.save();
    }
    return entities;
  }

  async softDeleteWithUpdate(
    filter: Record<string, any>,
    update: UpdateQuery<T>,
  ): Promise<T[]> {
    return this.updateMany(filter, { ...update, isDeleted: true });
  }

  async createOne(input: Partial<T>, mapFn?: (item: T) => any): Promise<T> {
    const entity = new this.model(input);
    const savedEntity = await entity.save();
    return mapFn ? mapFn(savedEntity) : savedEntity;
  }

  async bulkCreate(input: Partial<T>[]): Promise<T[]> {
    const result = await this.model.insertMany(input);
    return result as unknown as T[];
  }

  async updateOneFromExistingModel(model: T, input: Partial<T>): Promise<T> {
    Object.assign(model, input);
    return model.save();
  }

  async deleteMany(filter: Record<string, any>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount || 0;
  }

  async deleteOne(filter: Record<string, any>): Promise<T | null> {
    return this.model.findOneAndDelete(filter).exec();
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async deleteOneOrFail(
    filter: Record<string, any>,
    errorMessage?: ErrorMessageEnum,
  ): Promise<T> {
    const result = await this.model.findOneAndDelete(filter).exec();
    if (!result) {
      throw new AppHttpException(errorMessage || ErrorMessageEnum.NOT_FOUND);
    }
    return result;
  }
}
