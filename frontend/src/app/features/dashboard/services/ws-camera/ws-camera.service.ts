import { Injectable } from '@angular/core';
import { WebSocketService } from '../web-socket/web-socket.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CameraData {
  distances: number[];
  timestamp: number;
}

/**
 * @class WsCameraService
 * @brief Serwis dedykowany do obsługi danych z czujnika Lidar (wizualizacja "kamery").
 *
 * Filtruje i mapuje surowe dane przychodzące z serwisu WebSocket na ustrukturyzowany format CameraData.
 */
@Injectable({
  providedIn: 'root',
})
export class WsCameraService {
  /**
   * @brief Konstruktor serwisu kamery Lidar.
   * @param ws Główny serwis komunikacji WebSocket.
   */
  constructor(private ws: WebSocketService) {}

  /**
   * @brief Pobiera strumień danych Lidar.
   * @return Observable z odległościami (tablica 64 elementów) i znacznikiem czasu.
   */
  getLidarData$(): Observable<CameraData> {
    return this.ws.on<any>('lidar:data').pipe(
      map((data: any) => ({
        distances: data.distances || [],
        timestamp: data.timestamp || Date.now(),
      }))
    );
  }
}
