'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
}

export default function AdBanner({ 
  adSlot, 
  adFormat = 'auto', 
  style = { display: 'block', minWidth: '320px', minHeight: '50px' },
  className = ''
}: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Проверяем, что элемент видим и имеет размеры
    const checkAndLoadAd = () => {
      if (!adRef.current) return;
      
      const rect = adRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        try {
          // @ts-ignore
          if (window.adsbygoogle) {
            // Проверяем, что реклама еще не загружена
            const adElement = adRef.current.querySelector('.adsbygoogle');
            if (adElement && !adElement.hasAttribute('data-adsbygoogle-status')) {
              // @ts-ignore
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
          }
        } catch (err) {
          console.error('AdSense error:', err);
        }
      } else {
        // Если элемент еще не видим, попробуем через небольшую задержку
        setTimeout(checkAndLoadAd, 100);
      }
    };

    // Задержка для загрузки AdSense скрипта
    const timer = setTimeout(checkAndLoadAd, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={adRef} className={`ad-container ${className}`} style={{ minWidth: '320px', minHeight: '50px' }}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-3205919903681434"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
        key={`ad-${adSlot}-${Date.now()}`}
      />
    </div>
  );
}
