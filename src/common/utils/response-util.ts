import { ResponseMessageEnum } from '../enums/response-message.enum';

export class ApiUtil {
  static formatResponse(
    statusCode: number,
    message: ResponseMessageEnum,
    data?: any,
    pageInfo?: {
      limit: number;
      page: number;
      hasPrevious: boolean;
      hasNext: boolean;
      totalCount: number;
      pagesCount: number;
    },
  ) {
    return {
      success: true,
      statusCode,
      message,
      data,
      pageInfo,
    };
  }
}
