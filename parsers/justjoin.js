module.exports = async function parseJustJoin(page) {
  try {
    // Проверяем, что страница еще валидна
    if (page.isClosed()) {
      console.log('Page is already closed, returning empty results');
      return [];
    }
    
    console.log('Waiting for job list container...');
  
    // Ждем загрузки страницы и пробуем найти контент
    console.log('Waiting for page to load...');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Даем время на загрузку
    
    // Ждем появления первых вакансий
    try {
      await page.waitForSelector('li.MuiBox-root.mui-1hy6knc', { timeout: 10000 });
      console.log('First jobs loaded');
    } catch (e) {
      console.log('No jobs found initially, continuing...');
    }
    
    // Пробуем несколько селекторов для поиска списка вакансий
    const selectors = [
      'li.MuiBox-root.mui-1hy6knc', // Основной селектор для вакансий
      'li[class*="mui-1hy6knc"]',   // Альтернативный селектор
      '[data-test-id="virtuoso-item-list"]',
      '[data-testid="job-list"]',
      '.job-list',
      '[role="list"]',
      '.jobs-container',
      'ul[class*="job"]',
      'div[class*="job"]',
      'main',
      '.content',
      '[class*="offer"]',
      '[class*="listing"]'
    ];
      
      let found = false;
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 8000 });
          console.log(`Job list container found with selector: ${selector}`);
          found = true;
          break;
        } catch (e) {
          console.log(`Selector ${selector} not found, trying next...`);
        }
      }
      
      if (!found) {
        console.log('No job container found, trying to extract any job elements...');
        // Дополнительное время для динамической загрузки
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Отладочная информация
        if (!page.isClosed()) {
          try {
            const pageContent = await page.evaluate(() => {
              return {
                title: document.title,
                url: window.location.href,
                bodyText: document.body.innerText.substring(0, 500),
                allElements: document.querySelectorAll('*').length
              };
            });
            console.log('Page debug info:', pageContent);
          } catch (error) {
            console.log('Error getting debug info:', error.message);
          }
        }
      }
  
      const allJobs = new Map(); // Используем Map для хранения уникальных вакансий
      let hasMore = true;
  
    let scrollCount = 0;
    const maxScrolls = 20; // Увеличиваем количество скроллов
      
        while (hasMore && scrollCount < maxScrolls) {
        // Проверяем, что страница еще валидна
        if (page.isClosed()) {
          console.log('Page was closed, stopping scroll');
          break;
        }
        
        // Извлекаем данные с текущей видимой области
        if (page.isClosed()) {
          console.log('Page was closed, stopping extraction');
          break;
        }
        
        let newJobs = [];
        try {
          // Дополнительная проверка перед page.evaluate
          if (page.isClosed()) {
            console.log('Page was closed before evaluate, stopping');
            break;
          }
          
        newJobs = await page.evaluate(() => {
          // Пробуем разные селекторы для поиска вакансий
          const selectors = [
            'li.MuiBox-root.mui-1hy6knc', // Основной селектор для Just Join IT
            'li[class*="mui-1hy6knc"]',   // Альтернативный селектор
            'li[class*="offer"]',
            'li[class*="job"]',
            'li[class*="listing"]',
            'li',
            '[data-test-id="virtuoso-item-list"] [item="[object Object]"]',
            '[data-testid="job-card"]',
            '.job-card',
            '[role="listitem"]',
            'div[class*="job"]',
            'article',
            '.job-item',
            '[class*="offer"]',
            '[class*="listing"]',
            'a[href*="/offers/"]',
            'div[class*="offer"]',
            'div[class*="listing"]'
          ];
          
          let jobItems = [];
          for (const selector of selectors) {
            jobItems = Array.from(document.querySelectorAll(selector));
            if (jobItems.length > 0) {
              console.log(`Found ${jobItems.length} jobs with selector: ${selector}`);
              break;
            }
          }
          
          return jobItems
            .filter(job => {
              const text = job.innerText || '';
              // Проверяем, что это вакансия, а не категория
              const hasJobContent = text.includes('PLN') || text.includes('Undisclosed Salary') || 
                                  text.includes('left') || text.includes('ago') ||
                                  job.querySelector('a[href*="/offers/"]') || 
                                  job.querySelector('a[href*="/job/"]');
              return hasJobContent && text.length > 50; // Минимальная длина текста
            })
            .map(job => {
            const text = job.innerText || '';
            const lines = text.split('\n').filter(line => line.trim());
            
            // Ищем заголовок вакансии - обычно первая строка
            let title = 'No title';
            if (lines.length > 0) {
              title = lines[0].trim();
            }
        
            // Ищем название компании - обычно третья строка (после зарплаты)
            let company = 'No company';
            if (lines.length > 2) {
              company = lines[2].trim();
            }
        
            // Ищем ссылку на вакансию
            const urlElement = job.querySelector('a[href*="/offers/"], a[href*="/job/"], a');
            const url = urlElement ? 
              (urlElement.href.startsWith('http') ? urlElement.href : `https://justjoin.it${urlElement.getAttribute('href')}`) : 'No URL';
        
            // Извлечение зарплаты из текста
            let salaryMin = null;
            let salaryMax = null;
            let salaryType = null;
            let salaryLog = null;
        
            // Ищем зарплату в тексте
            const salaryMatch = text.match(/(\d+(?:\s+\d+)*)\s*-\s*(\d+(?:\s+\d+)*)\s*PLN\/(\w+)/);
            if (salaryMatch) {
              salaryMin = parseInt(salaryMatch[1].replace(/\s/g, ''));
              salaryMax = parseInt(salaryMatch[2].replace(/\s/g, ''));
              salaryType = salaryMatch[3] === 'month' ? 'monthly' : salaryMatch[3];
              salaryLog = `Found salary: ${salaryMin}-${salaryMax} PLN/${salaryMatch[3]}`;
            } else {
              // Проверяем на фиксированную зарплату
              const fixedSalaryMatch = text.match(/(\d+(?:\s+\d+)*)\s*PLN\/(\w+)/);
              if (fixedSalaryMatch) {
                salaryMin = parseInt(fixedSalaryMatch[1].replace(/\s/g, ''));
                salaryMax = salaryMin;
                salaryType = fixedSalaryMatch[2] === 'month' ? 'monthly' : fixedSalaryMatch[2];
                salaryLog = `Found fixed salary: ${salaryMin} PLN/${fixedSalaryMatch[2]}`;
              } else {
                salaryLog = 'No salary found in text';
              }
            }
        
            return { title, company, url, salaryMin, salaryMax, salaryType, salaryLog };
          });
        });
        } catch (error) {
          console.log('Error during page.evaluate:', error.message);
          if (error.message.includes('detached frame') || error.message.includes('Target closed')) {
            console.log('Page was detached or closed, stopping extraction');
            break;
          }
          newJobs = [];
        }
          
          // Логируем данные зарплаты в Node.js
          newJobs.forEach(job => {
            if (job.salaryLog) {
              console.log(job.salaryLog);
            }
          });
  
        // Добавляем новые вакансии в Map
        newJobs.forEach(job => {
          allJobs.set(job.url, job); // Используем URL как уникальный ключ
        });
  
        console.log(`Extracted ${newJobs.length} jobs, total so far: ${allJobs.size}`);
  
      // Прокручиваем страницу вниз
      try {
        const previousJobCount = allJobs.size;
        
        hasMore = await page.evaluate(() => {
          const footer = document.querySelector('footer');
          if (footer && footer.getBoundingClientRect().top < window.innerHeight) {
            return false; // Достигли конца страницы
          }
          
          // Прокручиваем по частям для лучшей загрузки контента
          window.scrollBy(0, 300);
          return true;
        });
        
        // Если количество вакансий не изменилось после многих скроллов, останавливаемся
        if (scrollCount > 15 && allJobs.size === previousJobCount) {
          console.log('No new jobs loaded after many scrolls, stopping');
          hasMore = false;
        }
      } catch (error) {
        console.log('Error during scroll, stopping:', error.message);
        hasMore = false;
      }

      scrollCount++;
      console.log(`Scroll ${scrollCount}/${maxScrolls}, jobs found: ${allJobs.size}`);

      // Увеличиваем задержку для подгрузки новых элементов
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Дополнительно ждем появления новых элементов
      try {
        await page.waitForFunction(
          () => document.querySelectorAll('li.MuiBox-root.mui-1hy6knc').length > 0,
          { timeout: 2000 }
        );
      } catch (e) {
        // Игнорируем ошибки таймаута
      }
      }
  
      const jobsArray = Array.from(allJobs.values()); // Преобразуем Map в массив
      console.log(`Total extracted ${jobsArray.length} jobs from justjoin.it`);
      return jobsArray.map(job => ({
        ...job,
        source: 'justjoin.it',
      }));
    } catch (error) {
      console.error('Error in parseJustJoin:', error);
      return [];
    }
  }
