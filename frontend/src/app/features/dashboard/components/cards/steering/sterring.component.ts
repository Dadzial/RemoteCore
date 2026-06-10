import {Component, ElementRef, HostListener, ViewChild, signal, computed} from '@angular/core';
import {WsSteeringService} from '../../../services/ws-steering/ws-steering.service';

export enum ModeCommands {
  Joystick = 'Joystick',
  Keyboard = 'Keyboard',
}

@Component({
  selector: 'app-steering',
  standalone: false,
  templateUrl: './sterring.component.html',
  styleUrl: './sterring.component.css',
})
/**
 * @class SteeringComponent
 * @brief Komponent odpowiedzialny za interfejs sterowania robotem.
 *
 * Obsługuje dwa tryby sterowania: Joystick (mysz/dotyk) oraz Keyboard (klawisze WASD).
 * Oblicza miksowanie kanałów (lewy/prawy silnik) na podstawie wychylenia kontrolera
 * i wysyła komendy przez WebSocket.
 */
export class SteeringComponent {
  @ViewChild('container') container!: ElementRef;

  protected readonly ModeCommands = ModeCommands;
  public joyStickPos = signal({x: 0, y: 0});
  public activeMode = signal<ModeCommands>(ModeCommands.Joystick);

  /**
   * @brief Styl CSS dla "grzybka" joysticka, aktualizowany reaktywnie.
   */
  public readonly thumbStyle = computed(() => ({
    transform: `translate(${this.joyStickPos().x}px, ${this.joyStickPos().y}px)`
  }));

  /**
   * @brief Konstruktor komponentu sterowania.
   * @param ws Serwis WebSocket do wysyłania komend ruchu.
   */
  constructor(private ws: WsSteeringService) {}

  public dragging = false;
  private maxRadius = 60;
  public pressedKeys = new Set<string>();

  /**
   * @brief Obsługa wciśnięcia klawisza na klawiaturze.
   */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.activeMode() !== ModeCommands.Keyboard) return;
    this.pressedKeys.add(event.key.toLowerCase());
    this.updateFromKeyboard();
  }

  /**
   * @brief Obsługa puszczenia klawisza na klawiaturze.
   */
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (this.activeMode() !== ModeCommands.Keyboard) return;
    this.pressedKeys.delete(event.key.toLowerCase());
    this.updateFromKeyboard();
  }

  /**
   * @brief Obsługa wirtualnych przycisków WASD (interfejs dotykowy/klikany).
   */
  public onVisualKeyStart(key: string) {
    this.pressedKeys.add(key.toLowerCase());
    this.updateFromKeyboard();
  }

  public onVisualKeyEnd(key: string) {
    this.pressedKeys.delete(key.toLowerCase());
    this.updateFromKeyboard();
  }

  /**
   * @brief Przetwarza stan wciśniętych klawiszy na kierunki X/Y i wysyła komendę.
   */
  private updateFromKeyboard() {
    let x = 0;
    let y = 0;

    if (this.pressedKeys.has('w') || this.pressedKeys.has('arrowup')) y += 1;
    if (this.pressedKeys.has('s') || this.pressedKeys.has('arrowdown')) y -= 1;
    if (this.pressedKeys.has('a') || this.pressedKeys.has('arrowleft')) x -= 1;
    if (this.pressedKeys.has('d') || this.pressedKeys.has('arrowright')) x += 1;

    if (x === 0 && y === 0) {
      this.sendStop();
    } else {
      this.sendSteeringCommand(y, x);
    }
  }

  /**
   * @brief Rozpoczyna przeciąganie joysticka.
   */
  onStart(event: MouseEvent | TouchEvent) {
    if (this.activeMode() !== ModeCommands.Joystick) return;
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
    this.onMove(event);
  }

  /**
   * @brief Obsługuje ruch joysticka i oblicza jego wychylenie względem środka.
   */
  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onMove(event: MouseEvent | TouchEvent) {
    if (!this.dragging || this.activeMode() !== ModeCommands.Joystick) return;

    if (event instanceof TouchEvent) event.preventDefault();

    const rect = this.container.nativeElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Ograniczenie ruchu joysticka do maksymalnego promienia
    if (distance > this.maxRadius) {
      deltaX *= this.maxRadius / distance;
      deltaY *= this.maxRadius / distance;
    }

    this.updatePosition(deltaX, deltaY);
  }

  /**
   * @brief Zakończenie ruchu joysticka - powrót do środka i stop.
   */
  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onEnd() {
    if (!this.dragging) return;
    this.dragging = false;
    this.updatePosition(0, 0);
    this.sendStop();
  }

  /**
   * @brief Aktualizuje pozycję wizualną i wysyła obliczoną komendę.
   * @param x Wychylenie w osi X.
   * @param y Wychylenie w osi Y.
   */
  private updatePosition(x: number, y: number) {
    this.joyStickPos.set({ x, y });
    this.sendSteeringCommand(y / this.maxRadius * -1, x / this.maxRadius);
  }

  /**
   * @brief Oblicza wartości mocy dla lewego i prawego silnika (Differential Drive).
   *
   * Algorytm miksowania:
   * - lewy = (przód/tył + lewo/prawo)
   * - prawy = (przód/tył - lewo/prawo)
   * Wyniki są ograniczane do zakresu -100 do 100.
   *
   * @param y Składowa przód-tył (-1 do 1).
   * @param x Składowa lewo-prawo (-1 do 1).
   */
  private sendSteeringCommand(y: number, x: number): void {
    let left  = (y + x) * 100;
    let right = (y - x) * 100;

    left  = Math.max(-100, Math.min(100, left));
    right = Math.max(-100, Math.min(100, right));

    this.ws.sendSteeringCommand(left, right);
  }

  /**
   * @brief Zmienia tryb sterowania (Joystick/Keyboard).
   * @param command Wybrany tryb.
   */
  public onCommandClick(command: ModeCommands): void {
    this.activeMode.set(command);
    this.sendStop();
    this.updatePosition(0, 0);
    this.pressedKeys.clear();
  }

  /**
   * @brief Wysyła polecenie zatrzymania silników.
   */
  private sendStop(): void {
    this.ws.sendStop();
  }
}
