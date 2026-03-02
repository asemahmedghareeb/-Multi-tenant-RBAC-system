import { ValidationPipe } from '@nestjs/common';
import { AppHelperService } from 'src/modules/core/app-helper/services/app-helper.service';
import { validationPipeExceptionFactory } from '../utils/validation-pipe-exception.factory';
import { LangEnum } from '../enums/lang.enum';
import { I18nContext } from 'nestjs-i18n';

export const ValidationPipeFactory = (appHelperService: AppHelperService) => {
  return new ValidationPipe({
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },

    exceptionFactory: (errors) =>
      validationPipeExceptionFactory(
        errors,
        appHelperService,
        I18nContext.current()?.lang as LangEnum,
      ),
  });
};
