import { Injectable, Logger } from "@nestjs/common";
import { EventBusService } from "@/common/observability/event-bus.service";

@Injectable()
export class LoggerService {
  private readonly logger = new Logger("Inspectra");

  constructor(private readonly events: EventBusService) {}

  info(message: string, sessionId?: string) {
    this.logger.log(message);
    this.events.emit({ type: "log", level: "info", message, sessionId, timestamp: new Date().toISOString() });
  }

  warn(message: string, sessionId?: string) {
    this.logger.warn(message);
    this.events.emit({ type: "log", level: "warn", message, sessionId, timestamp: new Date().toISOString() });
  }

  error(message: string, sessionId?: string) {
    this.logger.error(message);
    this.events.emit({ type: "log", level: "error", message, sessionId, timestamp: new Date().toISOString() });
  }
}
