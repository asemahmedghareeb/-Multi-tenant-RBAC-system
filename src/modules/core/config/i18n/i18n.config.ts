import { join } from 'path';
import { HeaderResolver } from './i18n.provider';
import { I18nAsyncOptions, I18nOptions } from 'nestjs-i18n';
import { LangEnum } from 'src/common/enums/lang.enum';

export const I18nConfig: I18nAsyncOptions = {
  // The useFactory function dynamically creates the configuration object for the i18n module.
  useFactory: () => ({
    // Specifies the default language to fall back to if the user's preferred language is not available.
    fallbackLanguage: LangEnum.EN,

    // Disables the built-in middleware provided by nestjs-i18n.
    // This is useful if you want to handle language resolution manually or through custom middleware.
    disableMiddleware: true,
    
    // Configuration for loading localization files.
    loaderOptions: {
      // Specifies the directory where the localization files are stored.
      path: join(__dirname, '../../../../consts/i18n'),

      // Enables file watching to automatically reload localization files when they are modified.
      watch: true,
    },
  }),

  // Defines the resolvers used to determine the user's preferred language.
  // In this case, the HeaderResolver extracts the language from the request headers.
  resolvers: [HeaderResolver],
};
