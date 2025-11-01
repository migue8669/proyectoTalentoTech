import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.css'
})
export class Banner {



  @Input() logoSrc?: string; // optional logo image url
  @Input() productName: string = 'DiligenciApp';
  @Input() headline: string = 'Optimiza tus diligencias con DiligenciApp Pro';
  @Input() subheadline: string = 'La herramienta que organiza tu tiempo.';
  @Input() ctaText: string = 'Accede ahora y obtén beneficios exclusivos';
  @Input() ctaUrl?: string; // optional CTA link
  navigateToCta(event: Event): void {
  event.preventDefault();
  if (this.ctaUrl) {
    window.location.href = this.ctaUrl;
  }
}
}

/*
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
*/
