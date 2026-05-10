import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { OnEvent } from "@nestjs/event-emitter";
import { LoggerService } from "@/common/observability/logger.service";
import { RealtimeEvent } from "@/types/events";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly logger: LoggerService) {}

  afterInit(server: Server) {
    this.logger.info("Realtime Gateway Initialized", "RealtimeGateway");
  }

  handleConnection(client: Socket) {
    this.logger.info(`Client connected: ${client.id}`, "RealtimeGateway");
  }

  handleDisconnect(client: Socket) {
    this.logger.info(`Client disconnected: ${client.id}`, "RealtimeGateway");
  }

  @OnEvent("*")
  handleAnyEvent(payload: RealtimeEvent) {
    // Broadcast all internal events to connected clients
    // In production, we should filter by sessionId/userId rooms
    if (payload && typeof payload === "object" && "type" in payload) {
       this.server.emit("event", payload);
    }
  }
}
