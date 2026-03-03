import { Module } from '@nestjs/common';
import { WebsocketsGateway } from './websockets.gateway';
import { WebsocketsService } from './websockets.service';
import { WsThrottlerGuard } from './guards/ws-throttler.guard';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@Module({
  providers: [WebsocketsGateway, WebsocketsService, WsThrottlerGuard, WsJwtGuard],
  exports: [WebsocketsGateway, WebsocketsService],
})
export class WebsocketsModule {}
