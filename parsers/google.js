module.exports = async function parseGoogle(page) {
    try {
        console.log('Waiting for job list container...');
        // Пробуем несколько селекторов
        const selectors = [
            'ul.spHGqe',
            '[data-testid="job-card"]',
            '.job-card',
            'ul[role="list"]',
            '.job-listing'
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

        const jobs = await page.evaluate(() => {
            // Пробуем разные селекторы для поиска вакансий
            const selectors = [
                'ul.spHGqe > li.lLd3Je',
                '[data-testid="job-card"]',
                '.job-card',
                'ul[role="list"] > li',
                '.job-listing'
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
                const titleElement = job.querySelector('h3, h2, .job-title, [data-testid="job-title"]');
                const companyElement = job.querySelector('span, .company, [data-testid="company"]');
                const locationElement = job.querySelector('.location, [data-testid="location"]');
                const urlElement = job.querySelector('a');

                const title = titleElement ? titleElement.innerText.trim() : 'No title';
                const company = companyElement ? companyElement.innerText.trim() : 'Google';
                const location = locationElement ? locationElement.innerText.trim() : 'No location';
                const url = urlElement ? urlElement.href : 'No URL';

                return { title, company, location, url, source: 'google' };
            });
        });

        console.log(`Extracted ${jobs.length} jobs from Google Jobs`);
        return jobs;
    } catch (error) {
        console.error('Error in parseGoogle:', error);
        return [];
    }
};
