'use client';

import { useEffect } from 'react';

// Расширяем тип Window для gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function ConsentBanner() {
  useEffect(() => {
    // Загружаем Google CMP только если пользователь в EEA
    const loadGoogleCMP = () => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'default', {
          'ad_storage': 'denied',
          'analytics_storage': 'denied',
          'functionality_storage': 'denied',
          'personalization_storage': 'denied',
          'security_storage': 'granted',
          'wait_for_update': 500,
        });
      }
    };

    // Проверяем, нужен ли consent (EEA, UK, Switzerland)
    const needsConsent = () => {
      // Простая проверка по часовому поясу (можно улучшить)
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const eeaTimezones = [
        'Europe/Warsaw', 'Europe/Berlin', 'Europe/Paris', 'Europe/Rome',
        'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Vienna',
        'Europe/Prague', 'Europe/Budapest', 'Europe/Stockholm', 'Europe/Oslo',
        'Europe/Copenhagen', 'Europe/Helsinki', 'Europe/Athens', 'Europe/Lisbon',
        'Europe/Dublin', 'Europe/Luxembourg', 'Europe/Vilnius', 'Europe/Riga',
        'Europe/Tallinn', 'Europe/Sofia', 'Europe/Bucharest', 'Europe/Zagreb',
        'Europe/Ljubljana', 'Europe/Bratislava', 'Europe/Nicosia', 'Europe/Valletta',
        'Europe/London', 'Europe/Zurich'
      ];
      
      return eeaTimezones.some(tz => timezone.includes(tz.split('/')[1]));
    };

    if (needsConsent()) {
      loadGoogleCMP();
    }
  }, []);

  return null; // Google CMP сам создает UI
}
