import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket?: Socket;

  public connect(url: string): void {
    if (!this.socket) {
      this.socket = io(url);
    }
  }

  public on<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      this.socket?.on(event, (data: T) => observer.next(data));
      return () => this.socket?.off(event);
    });
  }

  public emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }

  public close(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
