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

  /** Throw NotFoundException when an entity matching options does not exist. */
  async findOneOrFail(
    filter: Record<string, any>,
    errorMessage?: ErrorMessageEnum,
    options: QueryOptions = {},
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
    return result;
  }

  /** Throw ForbiddenException when an entity matching options exists. */
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

  /** Find entities with pagination, sorting, relations (population), and selection. */
  async findPaginated(
    filter: Record<string, any> = {},
    sort?: string | { [key: string]: SortOrder },
    page: number = 1,
    limit: number = 15,
    options: QueryOptions = {},
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
      items,
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

  /** Update multiple entities matching filter with input. */
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

  /** Soft-delete via update (sets deletedAt and other input). */
  async softDeleteWithUpdate(
    filter: Record<string, any>,
    update: UpdateQuery<T>,
  ): Promise<T[]> {
    return this.updateMany(filter, { ...update, deletedAt: new Date() });
  }

  /** Create and save a single entity. */
  async createOne(input: Partial<T>): Promise<T> {
    const entity = new this.model(input);
    return entity.save();
  }

  /** Create and save multiple entities. */
  async bulkCreate(input: Partial<T>[]): Promise<T[]> {
    const result = await this.model.insertMany(input);
    return result as unknown as T[];
  }

  /** Update an existing model instance and save it. */
  async updateOneFromExistingModel(model: T, input: Partial<T>): Promise<T> {
    Object.assign(model, input);
    return model.save();
  }

  /** Delete multiple entities and return affected count. */
  async deleteMany(filter: Record<string, any>): Promise<number> {
    const result = await this.model.deleteMany(filter).exec();
    return result.deletedCount || 0;
  }

  /** Delete a single entity matching the filter. Returns the deleted document or null. */
  async deleteOne(filter: Record<string, any>): Promise<T | null> {
    return this.model.findOneAndDelete(filter).exec();
  }

  /** Delete a single entity by its ID. Returns the deleted document or null. */
  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  /** Delete a single entity or throw NotFoundException if it doesn't exist. */
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
