import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
import { Observable } from 'rxjs';

export interface DiagnosticLog {
  msg: string;
  type: 'info' | 'success' | 'warning' | 'error';
  t: number;
}

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

  public onLog(): Observable<DiagnosticLog> {
    return this.ws.on<DiagnosticLog>('diagnostic:log');
  }

  public onStatus(): Observable<SystemStatus> {
    return this.ws.on<SystemStatus>('diagnostic:status');
  }
}
