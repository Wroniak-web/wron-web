import { Container } from "@/components/Container";
import PaginationControls from "@/components/PaginationControls";
import SearchBar from "@/components/SearchBar";
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

async function readJsonFile(filename: string) {
  try {
    const filepath = path.join(DATA_DIR, filename);
    const content = await fs.readFile(filepath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

async function fetchItems(page: number, limit: number, searchQuery: string = "") {
  try {
    const data = await readJsonFile('all-jobs.json');
    if (!data) {
      return {
        items: [],
        totalItems: 0,
      };
    }
    
    let items = data.jobs || [];
    
    // Фильтрация по поисковому запросу
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter((job: any) => 
        job.title?.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query)
      );
    }
    
    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return {
      items: paginatedItems,
      totalItems: items.length,
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return {
      items: [],
      totalItems: 0,
    };
  }
}

export default async function Home({ searchParams }: { searchParams: { page?: string; search?: string } }) {
  const page = parseInt(searchParams.page || "1", 10); // Получить текущую страницу из URL
  const limit = 10; // Количество элементов на странице
  const searchQuery = searchParams.search || ""; // Получить текст поиска из URL
  const { items, totalItems } = await fetchItems(page, limit, searchQuery); // Загрузить данные с сервера

  const totalPages = Math.ceil(totalItems / limit); // Рассчитать общее количество страниц

  return (
    <Container>
      <div className="my-4 md:my-6 text-center px-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl text-gray-800 dark:text-gray-100 leading-tight">
          Wroniak to platforma stworzona specjalnie dla studentów, którzy szukają pracy dorywczej, stażu lub pierwszego doświadczenia zawodowego.
        </h1>
        <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-600 dark:text-gray-400 max-w-4xl mx-auto leading-relaxed">
          Naszym celem jest łączenie młodych, ambitnych osób z pracodawcami oferującymi elastyczne i przyjazne studentom oferty. Znajdziesz tutaj ogłoszenia z różnych branż — od gastronomii i sprzedaży, po IT, marketing czy pracę zdalną.
        </p>
      </div>
      <SearchBar initialQuery={searchQuery} />

      {/* Основной контент с местом для Auto Ads */}
      <div className="min-h-[600px] px-4">
        {/* Контейнер с ограниченной шириной для лучшей читаемости */}
        <div className="max-w-4xl mx-auto">
          {items.length > 0 ? (
            <ul className="space-y-3 md:space-y-4">
              {items.map((item: any, index: number) => (
                <div key={item._id}>
                  <li className="block p-3 md:p-4 border rounded-lg shadow hover:shadow-lg transition-shadow bg-white dark:bg-gray-800">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <h2 className="text-base md:text-lg font-semibold text-indigo-600 dark:text-indigo-400 mb-2 line-clamp-2">
                        {item.title}
                      </h2>
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-1">
                        <span className="font-medium">Firma:</span> {item.company}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Źródło:</span> {item.source}
                      </p>
                    </a>
                  </li>
                  
                </div>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center px-4">
              <div className="text-4xl md:text-6xl mb-4">🔍</div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Nie znaleziono ofert pracy
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4 md:mb-6 max-w-md">
                Spróbuj zmienić kryteria wyszukiwania lub sprawdź ponownie później.
              </p>
              <div className="text-xs md:text-sm text-gray-500 dark:text-gray-500">
                Znaleziono {totalItems} ofert pracy
              </div>
            </div>
          )}
          
          <div className="mt-6 md:mt-8 mb-12 md:mb-16">
            <PaginationControls currentPage={page} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </Container>
  );
}