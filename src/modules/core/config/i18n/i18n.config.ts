import { join } from 'path';
import { HeaderResolver } from './i18n.provider';
import { I18nAsyncOptions, I18nOptions } from 'nestjs-i18n';
import { LangEnum } from 'src/common/enums/lang.enum';

export const I18nConfig: I18nAsyncOptions = {
  useFactory: () => ({
    fallbackLanguage: LangEnum.EN,

    disableMiddleware: true,

    loaderOptions: {
      path: join(__dirname, '../../../../consts/i18n'),

      watch: true,
    },
  }),

  resolvers: [HeaderResolver],
};
