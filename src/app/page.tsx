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
      <div className="my-6 text-center">
        <h1 className="text-2xl text-gray-800 dark:text-gray-100">
          Wroniak to prosta i intuicyjna platforma stworzona specjalnie dla studentów, którzy szukają pracy dorywczej, stażu lub pierwszego doświadczenia zawodowego.
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Naszym celem jest łączenie młodych, ambitnych osób z pracodawcami oferującymi elastyczne i przyjazne studentom oferty. Znajdziesz tutaj ogłoszenia z różnych branż — od gastronomii i sprzedaży, po IT, marketing czy pracę zdalną.
        </p>
      </div>
      <SearchBar initialQuery={searchQuery} />
      <ul className="space-y-4">
        {items.map((item: any) => (
          <li
            key={item._id}
            className="block p-4 border rounded-lg shadow hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <h2 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                {item.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Firma: {item.company}
              </p>
              <p className="text-gray-500 text-sm dark:text-gray-400">
                Source: {item.source}
              </p>
            </a>
          </li>
        ))}
      </ul>
      <PaginationControls currentPage={page} totalPages={totalPages} />
    </Container>
  );
}