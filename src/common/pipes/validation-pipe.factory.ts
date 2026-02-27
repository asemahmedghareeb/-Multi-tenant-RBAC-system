import { ValidationPipe } from '@nestjs/common';
import { AppHelperService } from 'src/modules/core/app-helper/services/app-helper.service';
import { validationPipeExceptionFactory } from '../utils/validation-pipe-exception.factory';
import { LangEnum } from '../enums/lang.enum';
import { I18nContext } from 'nestjs-i18n';

// Factory function to create a customized ValidationPipe instance.
// This pipe is responsible for validating incoming request data and handling validation errors.
export const ValidationPipeFactory = (appHelperService: AppHelperService) => {
  return new ValidationPipe({
    // Enables automatic transformation of input data to match the expected types.
    transform: true,
    // Configuration options for the transformation process.
    transformOptions: {
      // Allows implicit type conversion (e.g., string to number).
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
