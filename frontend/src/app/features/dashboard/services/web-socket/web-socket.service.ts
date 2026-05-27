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
      console.log('[WS] Connecting to:', url);
      this.socket = io(url, {
        transports: ['websocket'],
        reconnection: true
      });

      this.socket.on('connect', () => console.log('[WS] Connected:', this.socket?.id));
      this.socket.on('connect_error', (err) => console.error('[WS] Connection error:', err));
      this.socket.on('disconnect', (reason) => console.warn('[WS] Disconnected:', reason));
    }
  }

  public on<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      const checkAndSubscribe = () => {
        if (this.socket) {
          this.socket.on(event, (data: T) => observer.next(data));
        } else {
          // Jeśli gniazdo jeszcze nie istnieje, spróbuj ponownie za chwilę
          setTimeout(checkAndSubscribe, 100);
        }
      };

      checkAndSubscribe();
      return () => this.socket?.off(event);
    });
  }

  public emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn(`[WS] Cannot emit '${event}', socket not connected`);
    }
  }

  public close(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
