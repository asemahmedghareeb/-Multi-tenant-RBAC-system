import { HttpException } from '@nestjs/common';
import { ErrorMessageEnum } from '../enums/error-message.enum';
import { ERROR_CODE_CONFIG } from '../enums/error-code-config';
import { ValidationError } from 'class-validator';

// Custom exception class extending the built-in HttpException.
export class AppHttpException extends HttpException {
  public readonly errorMessageEnum: ErrorMessageEnum;
  private readonly httpStatusCode: number;

  constructor(
    // The error code enum (message key)
    errorMessageEnum: ErrorMessageEnum,

    // Additional metadata to include in the error response
    public extensions: {
      [key: string]: string | number | Partial<ValidationError>[];
    } = {},
  ) {
    // Get HTTP status code from config, default to 400
    const httpStatus = ERROR_CODE_CONFIG[errorMessageEnum] ?? 400;
    
    // Call parent with error code enum name and HTTP status
    super(errorMessageEnum, httpStatus);
    
    // Store the error code enum
    this.errorMessageEnum = errorMessageEnum;
    this.httpStatusCode = httpStatus;
  }
}
