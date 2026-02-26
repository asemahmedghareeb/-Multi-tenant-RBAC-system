import { HttpException } from '@nestjs/common';

export class AppException extends HttpException {
  constructor(
    message: string,
    statusCode: number,
    public key?: string,
    public token?: string,
  ) {
    super(
      {
        success: false,
        statusCode,
        message,
        key,
        token,
      },
      statusCode,
    );
  }
}
