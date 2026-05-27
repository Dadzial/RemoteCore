import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
import { Observable } from 'rxjs';

export interface SystemStatus {
  heap: number;
  rssi: number;
  uptime: number;
}

@Injectable({
  providedIn: 'root',
})
export class WsDiagnosticService {
  constructor(private ws: WebSocketService) {}

  public onStatus(): Observable<SystemStatus> {
    return this.ws.on<SystemStatus>('diagnostic:status');
  }
}
