import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
/**
 * @class HomeComponent
 * @brief Główny komponent dashboardu.
 *
 * Pełni rolę kontenera dla wszystkich kart funkcjonalnych (diagnostyka, żyroskop, kamera, sterowanie).
 * Odpowiada za układ graficzny (grid/flex) i responsywność widoku głównego.
 */
export class HomeComponent {}
