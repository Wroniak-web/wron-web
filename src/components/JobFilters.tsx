'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface JobFiltersProps {
  onFiltersChange?: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  workType: string[];
  location: string[];
  dateRange: string;
}

const WORK_TYPES = [
  { id: 'internship', label: 'Staż' },
  { id: 'full-time', label: 'Pełny etat' },
  { id: 'part-time', label: 'Część etatu' },
  { id: 'contract', label: 'Kontrakt' },
];

const LOCATIONS = [
  { id: 'wroclaw', label: 'Wrocław' },
  { id: 'remote', label: 'Zdalnie' },
  { id: 'hybrid', label: 'Hybrydowo' },
];

const DATE_RANGES = [
  { id: 'today', label: 'Dzisiaj' },
  { id: 'week', label: 'Tydzień' },
  { id: 'month', label: 'Miesiąc' },
  { id: 'all', label: 'Wszystkie' },
];

export default function JobFilters({ onFiltersChange, initialFilters }: JobFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    workType: [],
    location: [],
    dateRange: 'all',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Обновляем фильтры при изменении URL
  useEffect(() => {
    const newFilters: FilterState = {
      workType: searchParams.getAll('workType'),
      location: searchParams.getAll('location'),
      dateRange: searchParams.get('dateRange') || 'all',
    };
    setFilters(newFilters);
  }, [searchParams]);

  const handleFilterChange = (filterType: keyof FilterState, value: string | string[]) => {
    const newFilters = {
      ...filters,
      [filterType]: value,
    };
    setFilters(newFilters);
    
    // Обновляем URL с новыми фильтрами
    const params = new URLSearchParams(searchParams);
    
    // Очищаем старые параметры фильтров
    params.delete('workType');
    params.delete('location');
    params.delete('dateRange');
    params.delete('page'); // Сбрасываем страницу при изменении фильтров
    
    // Добавляем новые параметры
    if (newFilters.workType.length > 0) {
      newFilters.workType.forEach(workType => {
        params.append('workType', workType);
      });
    }
    
    if (newFilters.location.length > 0) {
      newFilters.location.forEach(location => {
        params.append('location', location);
      });
    }
    
    if (newFilters.dateRange !== 'all') {
      params.set('dateRange', newFilters.dateRange);
    }
    
    // Обновляем URL
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl);
    
    // Вызываем callback если он передан
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };


  const handleWorkTypeToggle = (workTypeId: string) => {
    const newWorkTypes = filters.workType.includes(workTypeId)
      ? filters.workType.filter(w => w !== workTypeId)
      : [...filters.workType, workTypeId];
    handleFilterChange('workType', newWorkTypes);
  };

  const handleLocationToggle = (locationId: string) => {
    const newLocations = filters.location.includes(locationId)
      ? filters.location.filter(l => l !== locationId)
      : [...filters.location, locationId];
    handleFilterChange('location', newLocations);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      workType: [],
      location: [],
      dateRange: 'all',
    };
    setFilters(clearedFilters);
    
    // Очищаем URL от всех параметров фильтров
    const params = new URLSearchParams(searchParams);
    params.delete('workType');
    params.delete('location');
    params.delete('dateRange');
    params.delete('page');
    
    // Сохраняем только поисковый запрос
    const search = params.get('search');
    const newUrl = search ? `/?search=${search}` : '/';
    router.push(newUrl);
  };

  const hasActiveFilters = filters.workType.length > 0 || filters.location.length > 0 || filters.dateRange !== 'all';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Filtry
        </h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Wyczyść wszystkie
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {isExpanded ? 'Zwiń' : 'Rozwiń'}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Тип pracy */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Typ pracy
            </h4>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map((workType) => (
                <button
                  key={workType.id}
                  onClick={() => handleWorkTypeToggle(workType.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.workType.includes(workType.id)
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {workType.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lokalizacja */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Lokalizacja
            </h4>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationToggle(location.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.location.includes(location.id)
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {location.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data publikacji */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Data publikacji
            </h4>
            <div className="flex flex-wrap gap-2">
              {DATE_RANGES.map((dateRange) => (
                <button
                  key={dateRange.id}
                  onClick={() => handleFilterChange('dateRange', dateRange.id)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.dateRange === dateRange.id
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {dateRange.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Aktywne filtry */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {filters.workType.map((workTypeId) => {
              const workType = WORK_TYPES.find(w => w.id === workTypeId);
              return (
                <span
                  key={workTypeId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {workType?.label}
                  <button
                    onClick={() => handleWorkTypeToggle(workTypeId)}
                    className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {filters.location.map((locationId) => {
              const location = LOCATIONS.find(l => l.id === locationId);
              return (
                <span
                  key={locationId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                >
                  {location?.label}
                  <button
                    onClick={() => handleLocationToggle(locationId)}
                    className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {filters.dateRange !== 'all' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                {DATE_RANGES.find(d => d.id === filters.dateRange)?.label}
                <button
                  onClick={() => handleFilterChange('dateRange', 'all')}
                  className="ml-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
