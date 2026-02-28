import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AppHttpException } from '../exceptions/app-http.exception';
import { Request, Response } from 'express';
import { LangEnum } from '../enums/lang.enum';
import { AppHelperService } from 'src/modules/core/app-helper/services/app-helper.service';
import { ThrottlerException } from '@nestjs/throttler';
import { ErrorMessageEnum } from '../enums/error-message.enum';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private readonly appHelperService: AppHelperService) {}

  catch(exception: AppHttpException, host: ArgumentsHost) {
    if (exception instanceof NotFoundException) {
      exception = new AppHttpException(ErrorMessageEnum.NOT_FOUND);
    }

    if (exception instanceof ThrottlerException) {
      exception = new AppHttpException(ErrorMessageEnum.TOO_MANY_REQUESTS);
    }

    if (!(exception instanceof AppHttpException)) {
      Logger.error(exception);
      exception = new AppHttpException(ErrorMessageEnum.SERVER_SIDE_ERROR);
    }

    const httpHost = host.switchToHttp();
    const response: Response = httpHost.getResponse();
    const request: Request = httpHost.getRequest();
    const lang = request.headers.lang as LangEnum;

    // Localize the message using the error code enum
    const message = this.appHelperService.localize(
      `errors.${exception.errorMessageEnum}`,
      {},
      Object.values(LangEnum).includes(lang) ? lang : undefined,
    );

    return response.status(exception.getStatus()).send({
      success: false,
      message,
      Code: exception.getStatus(),
      extension: exception.extensions,
    });
  }
}
