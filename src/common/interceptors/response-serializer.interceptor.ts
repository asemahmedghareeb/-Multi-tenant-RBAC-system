import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { AppHelperService } from 'src/modules/core/app-helper/services/app-helper.service';
import { LangEnum } from '../enums/lang.enum';
import { Request } from 'express';

@Injectable()
export class ResponseSerializerInterceptor<T> implements NestInterceptor<T> {
  constructor(private readonly appHelperService: AppHelperService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request: Request = context.switchToHttp().getRequest();
    const lang = request.headers.lang as LangEnum;
    const resolvedLang = Object.values(LangEnum).includes(lang)
      ? lang
      : undefined;

    return next.handle().pipe(
      map((res) => {
        if (res?.message) {
          res.message = this.appHelperService.localize(
            `messages.${res.message}`,
            {},
            resolvedLang,
          );
        }
        return res;
      }),
    );
  }
}
