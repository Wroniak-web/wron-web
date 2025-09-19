'use client';

import { useState, useEffect } from 'react';

interface CompanyLogoProps {
  companyName: string;
  logoUrl?: string | null;
  className?: string;
}

export default function CompanyLogo({ companyName, logoUrl: propLogoUrl, className = '' }: CompanyLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(propLogoUrl || null);
  const [isLoading, setIsLoading] = useState(!propLogoUrl);
  const [hasError, setHasError] = useState(!propLogoUrl);

  useEffect(() => {
    if (propLogoUrl) {
      // Если логотип уже загружен, используем его
      setLogoUrl(propLogoUrl);
      setIsLoading(false);
      setHasError(false);
    } else if (!companyName || companyName === "No company") {
      // Если нет компании, не показываем логотип
      setIsLoading(false);
      setHasError(true);
    } else {
      // Если логотип не загружен, показываем пустое место
      setIsLoading(false);
      setHasError(true);
    }
  }, [companyName, propLogoUrl]);

  if (isLoading) {
    return (
      <div className={`w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center ${className}`}>
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hasError || !logoUrl) {
    // Возвращаем пустое место с фиксированной шириной
    return (
      <div className={`w-8 h-8 ${className}`} />
    );
  }

  return (
    <div className={`w-8 h-8 rounded overflow-hidden ${className}`}>
      <img
        src={logoUrl}
        alt={`${companyName} logo`}
        className="w-full h-full object-contain"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
