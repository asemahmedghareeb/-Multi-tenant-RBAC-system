import { Global, Module } from '@nestjs/common';
import { AppHelperService } from './services/app-helper.service';

@Global()
@Module({
  providers: [AppHelperService],
  exports: [AppHelperService],
})
export class AppHelperModule {}
