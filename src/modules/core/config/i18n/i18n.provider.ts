import { Injectable, ExecutionContext } from '@nestjs/common';
import { I18nResolver } from 'nestjs-i18n';

@Injectable()
export class HeaderResolver implements I18nResolver {
  resolve(context: ExecutionContext) {
    if (context.getType() == 'http') {
      return context.switchToHttp().getRequest().headers.lang;
    }
  }
}
