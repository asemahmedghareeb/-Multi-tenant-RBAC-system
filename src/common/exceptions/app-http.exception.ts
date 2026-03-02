import { HttpException } from '@nestjs/common';
import { ErrorMessageEnum } from '../enums/error-message.enum';
import { ERROR_CODE_CONFIG } from '../enums/error-code-config';
import { ValidationError } from 'class-validator';

export class AppHttpException extends HttpException {
  public readonly errorMessageEnum: ErrorMessageEnum;
  private readonly httpStatusCode: number;

  constructor(
    errorMessageEnum: ErrorMessageEnum,

    public extensions: {
      [key: string]: string | number | Partial<ValidationError>[];
    } = {},
  ) {
    const httpStatus = ERROR_CODE_CONFIG[errorMessageEnum] ?? 400;
    
    super(errorMessageEnum, httpStatus);
    
    this.errorMessageEnum = errorMessageEnum;
    this.httpStatusCode = httpStatus;
  }
}
