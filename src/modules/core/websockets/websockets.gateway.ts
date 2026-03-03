import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WebsocketsService } from './websockets.service';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { WsThrottlerGuard } from './guards/ws-throttler.guard';
import { WsMessageValidationInterceptor } from './interceptors/ws-message-validation.interceptor';
import { UserTokensService } from 'src/modules/app/auth-base/user-tokens/user-tokens.service';
import { AppHttpException } from 'src/common/exceptions/app-http.exception';
import { ErrorMessageEnum } from 'src/common/enums/error-message.enum';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
})
export class WebsocketsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly websocketsService: WebsocketsService,
    private readonly jwtService: JwtService,
    private readonly wsThrottlerGuard: WsThrottlerGuard,
    private readonly userTokensService: UserTokensService,
  ) {}

  afterInit(server: Server) {
    // Add middleware for token validation on connection
    server.use(async (socket, next) => {
      let token = socket.handshake.auth?.token;

      // If no token in auth, try to extract from authorization header
      if (!token && socket.handshake.headers?.authorization) {
        const authHeader = socket.handshake.headers.authorization;
        // Handle both "Bearer {token}" and plain token formats (case-insensitive)
        if (authHeader.toLowerCase().startsWith('bearer ')) {
          token = authHeader.slice(7);
        } else {
          token = authHeader;
        }
      }

      if (!token) {
        return next(new AppHttpException(ErrorMessageEnum.UNAUTHORIZED));
      }

      try {
        const payload = this.jwtService.verify(token);

        // Verify token exists in database
        const tokenExists =
          await this.userTokensService.verifyTokenInDatabase(token);

        if (!tokenExists) {
          return next(new AppHttpException(ErrorMessageEnum.INVALID_TOKEN));
        }

        socket.data.user = payload;
        next();
      } catch (error) {
        next(new AppHttpException(ErrorMessageEnum.INVALID_TOKEN));
      }
    });
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    const userId = client.data.user?.id;

    this.websocketsService.handleConnection(client, userId);
    console.log(`Client connected: ${client.id}, User: ${userId}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = client.data.user?.id;

    this.websocketsService.handleDisconnect(client, userId);
    // Clean up throttler tracking for this connection
    this.wsThrottlerGuard.cleanupConnection(client.id, userId);
    console.log(`Client disconnected: ${client.id}, User: ${userId}`);
  }

  @UseGuards(WsJwtGuard, WsThrottlerGuard)
  @UseInterceptors(WsMessageValidationInterceptor)
  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ): void {
    const userId = client.data.user?.id;
    console.log(`Message from user ${userId} client (${client.id}):`, data);
    this.websocketsService.handleMessage(client, data, userId);
  }

  @UseGuards(WsJwtGuard, WsThrottlerGuard)
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const userId = client.data.user?.id;
    const response = { message: 'pong', timestamp: Date.now(), userId };
    client.emit('pong', response);
    return response;
  }

  broadcastToAll(event: string, data: any): void {
    this.server.emit(event, data);
  }

  broadcastToClient(clientId: string, event: string, data: any): void {
    this.server.to(clientId).emit(event, data);
  }

  broadcastToRoom(room: string, event: string, data: any): void {
    this.server.to(room).emit(event, data);
  }

  broadcastToUser(userId: string, event: string, data: any): void {
    const client = this.websocketsService.getClientByUserId(userId);
    if (client) {
      client.emit(event, data);
    }
  }
}
