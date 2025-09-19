'use client';

interface PageLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export default function PageLoader({ isLoading, children }: PageLoaderProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Ładowanie ofert pracy...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
