import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GyroData, WsGyroService} from '../../../services/ws-gryo/ws-gyro.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-gryo',
  standalone: false,
  templateUrl: './gryo.component.html',
  styleUrl: './gryo.component.css',
})
/**
 * @class GryoComponent
 * @implements {OnInit, OnDestroy, AfterViewInit}
 * @brief Komponent wizualizujący dane z jednostki IMU (akcelerometr i żyroskop).
 *
 * Wyświetla aktualne przyspieszenia (osie X, Y, Z), orientację (Pitch, Roll, Yaw)
 * oraz sztuczny horyzont. Dodatkowo rysuje wykresy historyczne dla tych danych na elementach Canvas.
 */
export class GryoComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('accelChart') accelCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('orientChart') orientCanvas!: ElementRef<HTMLCanvasElement>;

  public gyroData?: GyroData;
  private sub?: Subscription;
  private history: GyroData[] = [];
  private readonly MAX_HISTORY = 100;

  /**
   * @brief Konstruktor komponentu żyroskopu.
   * @param ws Serwis WebSocket dostarczający dane IMU.
   */
  constructor(private ws: WsGyroService) {}

  /**
   * @brief Inicjalizacja komponentu.
   * Subskrybuje dane IMU, aktualizuje historię pomiarów i odświeża wykresy.
   */
  ngOnInit() {
    this.sub = this.ws.getGyroData$().subscribe((data: GyroData | undefined) => {
      if (data) {
        this.gyroData = data;
        this.updateHistory(data);
        this.drawCharts();
      }
    });
  }

  /**
   * @brief Cykl życia po zainicjowaniu widoku.
   * Przygotowuje elementy Canvas pod wykresy.
   */
  ngAfterViewInit() {
    this.initCharts();
  }

  /**
   * @brief Inicjalizuje wymiary płócien (Canvas) biorąc pod uwagę gęstość pikseli urządzenia.
   */
  private initCharts() {
    [this.accelCanvas, this.orientCanvas].forEach(canvas => {
      if (canvas) {
        canvas.nativeElement.width = canvas.nativeElement.offsetWidth * window.devicePixelRatio;
        canvas.nativeElement.height = canvas.nativeElement.offsetHeight * window.devicePixelRatio;
      }
    });
  }

  /**
   * @brief Aktualizuje bufor historii pomiarów.
   * Przechowuje do MAX_HISTORY ostatnich odczytów.
   * @param data Nowy odczyt IMU.
   */
  private updateHistory(data: GyroData) {
    this.history.push(data);
    if (this.history.length > this.MAX_HISTORY) {
      this.history.shift();
    }
  }

  /**
   * @brief Wywołuje rysowanie obu wykresów (przyspieszenia i orientacji).
   */
  private drawCharts() {
    this.drawSingleChart(this.accelCanvas, ['ax', 'ay', 'az'], 20, ['#4ade80', '#fbbf24', '#f87171']);
    this.drawSingleChart(this.orientCanvas, ['pitch', 'roll', 'yaw'], 180, ['#60a5fa', '#a78bfa', '#f472b6']);
  }

  /**
   * @brief Rysuje pojedynczy wykres liniowy na elemencie Canvas.
   * @param canvasRef Referencja do elementu Canvas.
   * @param keys Klucze danych z obiektu GyroData do narysowania.
   * @param range Zakres wartości (skalowanie osi Y).
   * @param colors Tablica kolorów dla poszczególnych linii.
   */
  private drawSingleChart(canvasRef: ElementRef<HTMLCanvasElement>, keys: string[], range: number, colors: string[]) {
    if (!canvasRef) return;
    const canvas = canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Rysowanie siatki tła
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for(let i=0; i<=4; i++) {
      const y = (canvas.height / 4) * i;
      ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Rysowanie linii danych
    keys.forEach((key, kidx) => {
      ctx.strokeStyle = colors[kidx];
      ctx.lineWidth = 2;
      ctx.beginPath();

      this.history.forEach((data: any, idx) => {
        const x = (canvas.width / (this.MAX_HISTORY - 1)) * idx;
        const val = data[key];
        const y = (canvas.height / 2) - (val / range) * (canvas.height / 2);

        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  /**
   * @brief Oblicza szerokość paska postępu (Progress Bar) na podstawie wartości.
   * @param value Aktualna wartość.
   * @param max Wartość maksymalna (100%).
   * @return Procentowa szerokość paska.
   */
  getBarWidth(value: number, max: number): number {
    const absVal = Math.abs(value);
    const percentage = (absVal / max) * 100;
    return Math.min(percentage, 100);
  }

  /**
   * @brief Sprzątanie subskrypcji.
   */
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
