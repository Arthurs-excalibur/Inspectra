import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Subscription } from "rxjs";
import { EventBusService } from "@/common/observability/event-bus.service";

@WebSocketGateway({
  namespace: "realtime",
  cors: {
    origin: "*",
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private subscription?: Subscription;

  constructor(private readonly events: EventBusService) {}

  onModuleInit() {
    this.subscription = this.events.events$.subscribe((event) => {
      this.server.emit(event.type, event);
      if ("sessionId" in event && event.sessionId) {
        this.server.to(event.sessionId).emit(event.type, event);
      }
    });
  }

  onModuleDestroy() {
    this.subscription?.unsubscribe();
  }

  handleConnection(client: Socket) {
    client.emit("connected", {
      status: "ok",
      message: "Inspectra realtime gateway connected",
    });
  }

  handleDisconnect() {
    return;
  }

  @SubscribeMessage("session:join")
  joinSession(@ConnectedSocket() client: Socket, @MessageBody() body: { sessionId: string }) {
    void client.join(body.sessionId);
    return { ok: true, sessionId: body.sessionId };
  }

  @SubscribeMessage("session:leave")
  leaveSession(@ConnectedSocket() client: Socket, @MessageBody() body: { sessionId: string }) {
    void client.leave(body.sessionId);
    return { ok: true, sessionId: body.sessionId };
  }
}
