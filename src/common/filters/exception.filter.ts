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


@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private readonly appHelperService: AppHelperService) {}



  catch(exception: AppHttpException, host: ArgumentsHost) {
    if (exception instanceof NotFoundException) {
      exception = new AppHttpException(exception.getStatus());
    }

    if (!(exception instanceof AppHttpException)) {
      Logger.error(exception);

      exception = new AppHttpException(500);
    }



    const httpHost = host.switchToHttp();
    const response: Response = httpHost.getResponse();
    const request: Request = httpHost.getRequest();
    const lang = request.headers.lang as LangEnum;
    const message = this.appHelperService.localize(
      `errors.${exception.message}`,
      {},
      Object.values(LangEnum).includes(lang as LangEnum) ? lang : undefined,
    );
    return response.status(exception.getStatus()).send({
      message,
      code: exception.getStatus(),
      extension: exception.extensions,
    });
  }
}
