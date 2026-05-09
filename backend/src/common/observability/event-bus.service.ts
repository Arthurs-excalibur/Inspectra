import { Injectable } from "@nestjs/common";
import { Subject } from "rxjs";
import type { RealtimeEvent } from "@/types/events";

@Injectable()
export class EventBusService {
  private readonly eventsSubject = new Subject<RealtimeEvent>();
  readonly events$ = this.eventsSubject.asObservable();

  emit(event: RealtimeEvent) {
    this.eventsSubject.next(event);
  }
}
