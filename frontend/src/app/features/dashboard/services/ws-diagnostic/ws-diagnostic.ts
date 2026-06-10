import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
import { Observable } from 'rxjs';

export interface SystemStatus {
  heap: number;
  rssi: number;
  uptime: number;
}

/**
 * @class WsDiagnosticService
 * @brief Serwis obsługujący monitorowanie statusu systemowego robota (pamięć, sygnał, uptime).
 */
@Injectable({
  providedIn: 'root',
})
export class WsDiagnosticService {
  /**
   * @brief Konstruktor serwisu statusu.
   * @param ws Serwis WebSocket.
   */
  constructor(private ws: WebSocketService) {}

  /**
   * @brief Zwraca strumień informacji o stanie sprzętowym robota.
   * @return Observable z danymi o heap, RSSI i uptime.
   */
  public onStatus(): Observable<SystemStatus> {
    return this.ws.on<SystemStatus>('diagnostic:status');
  }
}
