import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

/**
 * @class WebSocketService
 * @brief Generyczny serwis obsługujący komunikację przez Socket.io.
 *
 * Zapewnia metody do łączenia się z serwerem, odbierania zdarzeń jako Observable
 * oraz wysyłania (emitowania) danych. Obsługuje automatyczne ponawianie połączenia.
 */
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket?: Socket;

  /**
   * @brief Konstruktor serwisu WebSocket.
   * @param ngZone Usługa Angular NgZone do uruchamiania asynchronicznych zdarzeń wewnątrz strefy Angulara.
   */
  constructor(private ngZone: NgZone) {}

  /**
   * @brief Nawiązuje połączenie z serwerem WebSocket.
   * @param url Adres URL serwera.
   */
  public connect(url: string): void {
    if (!this.socket) {
      console.log('[WS] Connecting to:', url);
      this.socket = io(url, {
        transports: ['websocket'],
        reconnection: true
      });

      this.socket.on('connect', () => {
        this.ngZone.run(() => {
          console.log('[WS] Connected:', this.socket?.id);
        });
      });

      this.socket.on('connect_error', (err) => {
        this.ngZone.run(() => {
          console.error('[WS] Connection error:', err);
        });
      });

      this.socket.on('disconnect', (reason) => {
        this.ngZone.run(() => {
          console.warn('[WS] Disconnected:', reason);
        });
      });
    }
  }

  /**
   * @brief Tworzy strumień (Observable) dla konkretnego zdarzenia WebSocket.
   * @param event Nazwa zdarzenia.
   * @return Observable emitujący dane typu T.
   */
  public on<T>(event: string): Observable<T> {
    return new Observable((observer) => {
      const checkAndSubscribe = () => {
        if (this.socket) {
          this.socket.on(event, (data: T) => {
            this.ngZone.run(() => {
              observer.next(data);
            });
          });
        } else {
          // Czekaj na inicjalizację gniazda
          setTimeout(checkAndSubscribe, 100);
        }
      };

      checkAndSubscribe();
      return () => this.socket?.off(event);
    });
  }

  /**
   * @brief Wysyła dane do serwera WebSocket.
   * @param event Nazwa zdarzenia.
   * @param data Dane do wysłania (opcjonalne).
   */
  public emit(event: string, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn(`[WS] Cannot emit '${event}', socket not connected`);
    }
  }

  /**
   * @brief Zamyka połączenie WebSocket.
   */
  public close(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }
}
