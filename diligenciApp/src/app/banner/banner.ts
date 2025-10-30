import { Component } from '@angular/core';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.css'
})
export class Banner {

// La función principal para cargar el anuncio
  loadAdsenseAd(): void {
    // Verificamos si Google Ads está cargado globalmente
    if ((window as any).adsbygoogle && (window as any).adsbygoogle.push) {
      try {
        // Esto dispara la carga del anuncio en el placeholder HTML
        (window as any).adsbygoogle.push({});
        console.log('AdSense ad push successful.');
      } catch (e) {
        console.error('Error pushing AdSense ad:', e);
      }
    }
  }

  // ngAfterViewInit se ejecuta después de que la vista del componente ha sido renderizada.
  ngAfterViewInit(): void {
    // Usamos un pequeño timeout para asegurarnos de que el DOM está listo
    // y no interferir con la fase de detección de cambios de Angular.
    setTimeout(() => {
        this.loadAdsenseAd();
    }, 100);
  }
}
