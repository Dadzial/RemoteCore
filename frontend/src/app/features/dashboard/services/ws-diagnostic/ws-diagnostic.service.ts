import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
import { Observable } from 'rxjs';


export interface LogEntry {
  timestamp: string;
  message: string;
  level: string;
}

/**
 * @class WsDiagnosticService
 * @brief Serwis obsługujący odbieranie logów diagnostycznych z robota.
 */
@Injectable({
  providedIn: 'root',
})
export class WsDiagnosticService {
  /**
   * @brief Konstruktor serwisu logów.
   * @param ws Serwis WebSocket.
   */
  constructor(private ws: WebSocketService) {}

  /**
   * @brief Zwraca strumień logów systemowych (info, warning, error).
   * @return Observable z wpisami logów.
   */
  public onLog(): Observable<LogEntry> {
    return this.ws.on<LogEntry>('diagnostic:log');
  }
}
