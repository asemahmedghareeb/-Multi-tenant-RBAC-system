import { ResponseMessageEnum } from '../enums/response-message.enum';

export class ApiUtil {
  static formatResponse(
    statusCode: number,
    message: ResponseMessageEnum,
    data: { [key: string]: any } = {},
    totalCount?: number,
    page?: number,
    totalPages?: number,
  ) {
    return {
      success: true,
      statusCode,
      message,
      data,
      totalCount,
      page,
      totalPages,
    };
  }
}
