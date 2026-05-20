import { Injectable, signal } from '@angular/core';
import {WebSocketService} from '../web-socket/web-socket.service';

@Injectable({
  providedIn: 'root',
})
export class WsSteeringService {
  public currentSpeed = signal(0);

  constructor(private ws: WebSocketService) {}

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

  public sendStop(): void {
    this.currentSpeed.set(0);
    this.ws.emit('steering:stop');
  }
}
