import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeyGeneratorHelper {
  generateApiKey(prefix: string = 'sk', length: number = 32): string {
    const randomString = randomBytes(length).toString('hex');
    return `${prefix}_${randomString}`;
  }

  generateMultipleApiKeys(count: number, prefix: string = 'sk'): string[] {
    return Array.from({ length: count }, () => this.generateApiKey(prefix));
  }
}
