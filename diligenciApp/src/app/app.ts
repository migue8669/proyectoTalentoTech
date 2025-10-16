import { Component, signal } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps'; // Opcional, para usar referencias o eventos
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [GoogleMapsModule, CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('DiligenciApp');
}


