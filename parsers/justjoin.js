module.exports = async function parseJustJoin(page) {
    try {
      console.log('Waiting for job list container...');
      
      // Пробуем несколько селекторов для поиска списка вакансий
      const selectors = [
        '[data-test-id="virtuoso-item-list"]',
        '[data-testid="job-list"]',
        '.job-list',
        '[role="list"]',
        '.jobs-container',
        'ul[class*="job"]',
        'div[class*="job"]'
      ];
      
      let found = false;
      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 10000 });
          console.log(`Job list container found with selector: ${selector}`);
          found = true;
          break;
        } catch (e) {
          console.log(`Selector ${selector} not found, trying next...`);
        }
      }
      
      if (!found) {
        console.log('No job container found, trying to extract any job elements...');
      }
  
      const allJobs = new Map(); // Используем Map для хранения уникальных вакансий
      let hasMore = true;
  
      let scrollCount = 0;
      const maxScrolls = 10; // Ограничиваем количество скроллов
      
        while (hasMore && scrollCount < maxScrolls) {
        // Проверяем, что страница еще валидна
        if (page.isClosed()) {
          console.log('Page was closed, stopping scroll');
          break;
        }
        
        // Извлекаем данные с текущей видимой области
        const newJobs = await page.evaluate(() => {
            // Пробуем разные селекторы для поиска вакансий
            const selectors = [
              '[data-test-id="virtuoso-item-list"] [item="[object Object]"]',
              '[data-testid="job-card"]',
              '.job-card',
              '[role="listitem"]',
              'li[class*="job"]',
              'div[class*="job"]',
              'article',
              '.job-item'
            ];
            
            let jobItems = [];
            for (const selector of selectors) {
              jobItems = Array.from(document.querySelectorAll(selector));
              if (jobItems.length > 0) {
                console.log(`Found ${jobItems.length} jobs with selector: ${selector}`);
                break;
              }
            }
            
            return jobItems.map(job => {
              const titleElement = job.querySelector('h3');
              const title = titleElement ? titleElement.innerText.trim() : 'No title';
          
              const companyElement = job.querySelector('div:has(svg[data-testid="ApartmentRoundedIcon"]) span');
              const company = companyElement ? companyElement.innerText.trim() : 'No company';
          
              const urlElement = job.querySelector('a');
              const url = urlElement ? urlElement.href : 'No URL';
          
              // Извлечение зарплаты
              const salaryContainer = job.querySelector('div:has(span)'); // Контейнер с зарплатой
              let salaryMin = null;
              let salaryMax = null;
              let salaryType = null;
              let salaryLog = null;
          
              if (salaryContainer) {
                const salarySpans = Array.from(salaryContainer.querySelectorAll('span'));
                const salaryText = salarySpans.map(span => span.innerText.trim()).join(' '); // Объединяем текст всех <span>
                salaryLog = `Extracted salary text: "${salaryText}"`;
          
                // Извлекаем числа, включая числа с пробелами, запятыми и другими символами
                const salaryNumbers = salaryText
                    .match(/\d+(\.\d+)?K/gi) // Извлекаем числа с возможным суффиксом "K"
                    ?.map(num => {
                    const isThousand = num.toLowerCase().includes('k'); // Проверяем, есть ли "K"
                    const numericValue = parseFloat(num.replace(/k/gi, '').replace(',', '.')); // Убираем "K" и преобразуем в число
                    return isThousand ? numericValue * 1000 : numericValue; // Умножаем на 1000, если есть "K"
                    });

                if (salaryNumbers && salaryNumbers.length === 2) {
                    salaryMin = salaryNumbers[0];
                    salaryMax = salaryNumbers[1];
                } else if (salaryNumbers && salaryNumbers.length === 1) {
                    salaryMin = salaryNumbers[0];
                    salaryMax = salaryNumbers[0];
                }
          
                // Определение типа зарплаты
                if (salaryText.toLowerCase().includes('/month')) {
                  salaryType = 'monthly';
                } else if (salaryText.toLowerCase().includes('/h')) {
                  salaryType = 'hourly';
                }
              } else {
                salaryLog = 'No salary container found for this job.';
              }
          
              return { title, company, url, salaryMin, salaryMax, salaryType, salaryLog };
            });
          });
          
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
          hasMore = await page.evaluate(() => {
            const footer = document.querySelector('footer');
            if (footer && footer.getBoundingClientRect().top < window.innerHeight) {
              return false; // Достигли конца страницы
            }
            window.scrollBy(0, 300); // Прокручиваем вниз
            return true;
          });
        } catch (error) {
          console.log('Error during scroll, stopping:', error.message);
          hasMore = false;
        }

        scrollCount++;
        console.log(`Scroll ${scrollCount}/${maxScrolls}`);

        // Задержка для подгрузки новых элементов
        await new Promise(resolve => setTimeout(resolve, 500));
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
