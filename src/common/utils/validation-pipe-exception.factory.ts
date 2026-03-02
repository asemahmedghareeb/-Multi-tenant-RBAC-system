import { ValidationError } from 'class-validator';
import { ErrorMessageEnum } from '../enums/error-message.enum';
import { AppHttpException } from '../exceptions/app-http.exception';
import { AppHelperService } from 'src/modules/core/app-helper/services/app-helper.service';
import { ValidationErrorMessageEnum } from '../enums/validation-error-message.enum';
import { LangEnum } from '../enums/lang.enum';

export const validationPipeExceptionFactory = (
  errors: ValidationError[],
  appHelperService?: AppHelperService,
  lang?: LangEnum,
) => {
  return new AppHttpException(
    ErrorMessageEnum.BAD_REQUEST_EXCEPTION,
    {
      validationMessages: getValidationMessages(errors, appHelperService, lang),
    },
  );
};

const getValidationMessages = (
  errors: ValidationError[],
  appHelperService?: AppHelperService,
  lang?: LangEnum,
): any =>
  errors.map((error) => {
    if (!error.constraints && error.children) {
      return {
        property: error?.property,
        errors: getValidationMessages(error.children, appHelperService, lang),
      };
    }
    Object.keys(error.constraints as object).forEach((constraint) => {
      if (
        !ValidationErrorMessageEnum[
          (error.constraints as object)[constraint]
        ] ||
        !appHelperService
      )
        return;
      (error.constraints as object)[constraint] = appHelperService?.localize(
        `validation-errors.${(error.constraints as object)[constraint]}`,
        {},
        lang,
      );
    });
    return {
      property: error?.property,
      constraints: error?.constraints,
    };
  });
