"use client";

import { useRouter } from "next/navigation";

interface FilterState {
  workType: string[];
  location: string[];
  dateRange: string;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  searchQuery = '',
  filters = { workType: [], location: [], dateRange: 'all' }
}: {
  currentPage: number;
  totalPages: number;
  searchQuery?: string;
  filters?: FilterState;
}) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    console.log('🔄 Changing page to:', page);
    console.log('🔍 Current searchQuery:', searchQuery);
    console.log('🔍 Current filters:', filters);
    
    const params = new URLSearchParams();
    
    // Добавляем поисковый запрос
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    
    // Добавляем фильтры
    if (filters.workType.length > 0) {
      filters.workType.forEach(workType => {
        params.append('workType', workType);
      });
    }
    
    if (filters.location.length > 0) {
      filters.location.forEach(location => {
        params.append('location', location);
      });
    }
    
    if (filters.dateRange !== 'all') {
      params.set('dateRange', filters.dateRange);
    }
    
    // Добавляем страницу
    params.set('page', page.toString());
    
    const newUrl = `/?${params.toString()}`;
    console.log('🌐 Navigating to:', newUrl);
    
    // Переходим на новую страницу с сохранением всех параметров
    router.push(newUrl);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Генерация номеров страниц
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 7; // Максимум видимых страниц

    if (totalPages <= maxVisiblePages) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Всегда добавляем первую страницу
      pages.push(1);

      // Добавляем "..." если текущая страница далеко от начала
      if (currentPage > 4) {
        pages.push(-1); // -1 будет обозначать "..."
      }

      // Добавляем страницы вокруг текущей
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      // Добавляем "..." если текущая страница далеко от конца
      if (currentPage < totalPages - 3) {
        pages.push(-1); // -1 будет обозначать "..."
      }

      // Всегда добавляем последнюю страницу (если не первая)
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    // Удаляем дубликаты
    return [...new Set(pages)];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center mt-4 space-x-1 md:space-x-2">
      {/* Кнопка "Previous" */}
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className="px-2 md:px-4 py-2 text-xs md:text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">‹</span>
      </button>

      {/* Номера страниц - скрываем на очень маленьких экранах */}
      <div className="hidden xs:flex items-center space-x-1">
        {pageNumbers.map((page, index) =>
          page === -1 ? (
            // "..." для пропуска страниц
            <span key={index} className="px-2 py-1 text-gray-500 text-sm">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-2 md:px-3 py-1 text-xs md:text-sm rounded ${
                page === currentPage
                  ? "bg-indigo-700 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              } transition-colors`}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Показываем только текущую страницу на очень маленьких экранах */}
      <div className="xs:hidden flex items-center space-x-1">
        <span className="px-2 py-1 text-xs text-gray-500">
          {currentPage} / {totalPages}
        </span>
      </div>

      {/* Кнопка "Next" */}
      <button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className="px-2 md:px-4 py-2 text-xs md:text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">›</span>
      </button>
    </div>
  );
}
