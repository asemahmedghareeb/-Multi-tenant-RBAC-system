import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { LangEnum } from 'src/common/enums/lang.enum';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class AppHelperService {
  constructor(
    private readonly i18nService: I18nService) {}

  public generateRandomString(length: number, characterSet: string) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characterSet.charAt(
        Math.floor(Math.random() * characterSet.length),
      );
    }
    return result;
  }

  generateRandomNumber(length: number) {
    const characters = '0123456789';
    return this.generateRandomString(length, characters);
  }



  serializeArabic(text: string): string {
    const rli = '\u2067';
    const pdi = '\u2069';
    return `${rli}${text}${pdi}`;
  }

  localize(key: string, context: {}, lang?: LangEnum) {
    const localized = this.i18nService.t(key, {
      args: context,
      lang,
    }) as string;

    if (lang == LangEnum.AR) return this.serializeArabic(localized);
    return localized;
  }
}
