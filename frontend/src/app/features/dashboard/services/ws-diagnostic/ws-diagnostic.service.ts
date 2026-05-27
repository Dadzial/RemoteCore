import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
import { Observable } from 'rxjs';

export interface SystemStatus {
  rssi: number;
  uptime: number;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  level: string;
}

@Injectable({
  providedIn: 'root',
})
export class WsDiagnosticService {
  constructor(private ws: WebSocketService) {}

  public onStatus(): Observable<SystemStatus> {
    return this.ws.on<SystemStatus>('diagnostic:status');
  }

  public onLog(): Observable<LogEntry> {
    return this.ws.on<LogEntry>('diagnostic:log');
  }
}
