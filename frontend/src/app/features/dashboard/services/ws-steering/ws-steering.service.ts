import { Injectable, signal } from '@angular/core';
import {WebSocketService} from '../web-socket/web-socket.service';

/**
 * @class WsSteeringService
 * @brief Serwis odpowiedzialny za wysyłanie komend sterujących ruchem do robota.
 *
 * Przechowuje również stan aktualnej prędkości (wyliczonej) do celów wizualizacji.
 */
@Injectable({
  providedIn: 'root',
})
export class WsSteeringService {
  /**
   * @brief Reaktywna wartość aktualnej prędkości (m/s).
   */
  public currentSpeed = signal(0);

  /**
   * @brief Konstruktor serwisu sterowania.
   * @param ws Serwis WebSocket.
   */
  constructor(private ws: WebSocketService) {}

  /**
   * @brief Wysyła polecenie ruchu dla silników.
   *
   * Oblicza przybliżoną prędkość liniową na podstawie mocy silników:
   * speed = ((abs(left) + abs(right)) / 200) * 3.0 m/s.
   *
   * @param left Moc lewego silnika (-100 do 100).
   * @param right Moc prawego silnika (-100 do 100).
   */
  public sendSteeringCommand(left: number, right: number): void {
    const speed = ((Math.abs(left) + Math.abs(right)) / 200) * 3.0;
    this.currentSpeed.set(speed);

    const payload = {
      data: {
        leftMotor: Math.round(left),
        rightMotor: Math.round(right)
      }
    };
    this.ws.emit('steering:command', payload);
  }

  /**
   * @brief Wysyła polecenie natychmiastowego zatrzymania.
   * Zeruje aktualną prędkość.
   */
  public sendStop(): void {
    this.currentSpeed.set(0);
    this.ws.emit('steering:stop');
  }
}
