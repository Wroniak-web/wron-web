module.exports = async function parseAmazon(page) {
    try {
        console.log('Waiting for job list container...');
        
        // Пробуем несколько селекторов для поиска списка вакансий
        const selectors = [
            '.job-tile-lists',
            '[data-testid="job-list"]',
            '.job-list',
            '[role="list"]',
            '.jobs-container',
            'ul[class*="job"]',
            'div[class*="job"]',
            '.search-results',
            '.results-container'
        ];
        
        let found = false;
        for (const selector of selectors) {
            try {
                await page.waitForSelector(selector, { timeout: 15000 });
                console.log(`Job list container found with selector: ${selector}`);
                found = true;
                break;
            } catch (e) {
                console.log(`Selector ${selector} not found, trying next...`);
            }
        }
        
        if (!found) {
            console.log('No job container found, waiting for any job elements...');
            // Ждем немного дольше для динамической загрузки
            await page.waitForTimeout(5000);
        }

        const jobs = await page.evaluate(() => {
            // Пробуем разные селекторы для поиска вакансий
            const selectors = [
                '.job-tile',
                '[data-testid="job-card"]',
                '.job-card',
                '[role="listitem"]',
                'li[class*="job"]',
                'div[class*="job"]',
                'article',
                '.job-item',
                '.search-result-item'
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
                const titleElement = job.querySelector('h3.job-title a.job-link, h3 a, h2 a, .job-title a, a[href*="/job/"]');
                const locationElement = job.querySelector('.location-and-id ul li.text-nowrap, .location, .job-location');
                const jobIdElement = job.querySelector('.location-and-id ul li:nth-child(3), .job-id');
                const dateElement = job.querySelector('h2.posting-date, .posting-date, .date');
                const urlElement = job.querySelector('h3.job-title a.job-link, h3 a, h2 a, .job-title a, a[href*="/job/"]');

                const title = titleElement ? titleElement.innerText.trim() : 'No title';
                const location = locationElement ? locationElement.innerText.trim() : 'No location';
                const jobId = jobIdElement ? jobIdElement.innerText.replace('Job ID: ', '').trim() : 'No Job ID';
                const datePosted = dateElement ? dateElement.innerText.replace('Posted ', '').trim() : 'No date';
                const url = urlElement ? 
                    (urlElement.getAttribute('href').startsWith('http') ? 
                        urlElement.getAttribute('href') : 
                        `https://www.amazon.jobs${urlElement.getAttribute('href')}`) : 'No URL';

                return { title, location, jobId, datePosted, url, source: 'amazon' };
            });
        });

        console.log(`Extracted ${jobs.length} jobs from Amazon`);
        return jobs.map(job => ({
            ...job,
            company: 'Amazon',
        }));
    } catch (error) {
        console.error('Error in parseAmazon:', error);
        return [];
    }
};
