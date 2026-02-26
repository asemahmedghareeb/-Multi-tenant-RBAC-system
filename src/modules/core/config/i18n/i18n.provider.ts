import { Injectable, ExecutionContext } from '@nestjs/common';
import { I18nResolver } from 'nestjs-i18n';

@Injectable()
export class HeaderResolver implements I18nResolver {
  // The resolve method determines the user's preferred language based on the execution context.
  resolve(context: ExecutionContext) {
    // Check if the context is an HTTP request.
    if (context.getType() == 'http') {
      // Extract the 'lang' property from the HTTP request headers.
      return context.switchToHttp().getRequest().lang;
    }

  }
}
