import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface AuthenticatedClient {
  socket: Socket;
  userId: string;
  connectedAt: Date;
}

@Injectable()
export class WebsocketsService {
  public connectedClients = new Map<string, AuthenticatedClient>(); // socketId -> AuthenticatedClient
  public userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  handleConnection(client: Socket, userId: string): void {
    const clientData: AuthenticatedClient = {
      socket: client,
      userId,
      connectedAt: new Date(),
    };

    this.connectedClients.set(client.id, clientData);

    // Track socket by user ID for broadcasting to specific users
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    console.log(
      `Client connected: ${client.id}, User: ${userId}, Total clients: ${this.connectedClients.size}`,
    );
  }

  handleDisconnect(client: Socket, userId: string): void {
    this.connectedClients.delete(client.id);

    // Remove from user sockets mapping
    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    console.log(
      `Client disconnected: ${client.id}, User: ${userId}, Total clients: ${this.connectedClients.size}`,
    );
  }

  handleMessage(client: Socket, data: any, userId: string): void {
    console.log(`Message from user ${userId} client (${client.id}):`, data);
    // Handle message logic here
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  getConnectedClient(clientId: string): Socket | undefined {
    return this.connectedClients.get(clientId)?.socket;
  }

  getClientByUserId(userId: string): Socket | undefined {
    const socketsForUser = this.userSockets.get(userId);
    if (socketsForUser && socketsForUser.size > 0) {
      const socketId = Array.from(socketsForUser)[0];
      return this.connectedClients.get(socketId)?.socket;
    }
    return undefined;
  }

  getAllConnectedClients(): Map<string, AuthenticatedClient> {
    return this.connectedClients;
  }

  getUserConnectedSockets(userId: string): Socket[] {
    const socketIds = this.userSockets.get(userId) || new Set();
    return Array.from(socketIds)
      .map((socketId) => this.connectedClients.get(socketId)?.socket)
      .filter((socket) => socket !== undefined);
  }

  isUserOnline(userId: string): boolean {
    return (this.userSockets.get(userId)?.size || 0) > 0;
  }

  getOnlineUserCount(): number {
    return this.userSockets.size;
  }
}
