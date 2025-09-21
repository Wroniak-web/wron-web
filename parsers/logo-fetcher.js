const https = require('https');
const http = require('http');

// Функция для проверки существования логотипа
function checkLogoExists(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.get(url, { timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Функция для поиска логотипа компании
async function findCompanyLogo(companyName) {
  if (!companyName || companyName === "No company") {
    return null;
  }

  try {
    // Очищаем название компании от польских суффиксов
    const cleanCompanyName = companyName
      .replace(/\s+(sp\.?\s*z\s*o\.?o\.?|s\.?a\.?|ltd\.?|inc\.?|llc\.?|corp\.?|gmbh|ag|s\.r\.o\.?|a\.s\.?)$/i, '')
      .trim();
    
    const encodedCompanyName = encodeURIComponent(cleanCompanyName);
    
    // Пробуем разные варианты доменов
    const domains = [
      `${encodedCompanyName}.com`,
      `${encodedCompanyName}.pl`,
      `${encodedCompanyName}.eu`,
      `${encodedCompanyName}.org`,
      `${encodedCompanyName}.net`,
      `${encodedCompanyName}.de`,
      `${encodedCompanyName}.fr`
    ];
    
    for (const domain of domains) {
      const logoUrl = `https://logo.clearbit.com/${domain}`;
      const exists = await checkLogoExists(logoUrl);
      
      if (exists) {
        console.log(`Found logo for ${companyName}: ${logoUrl}`);
        return logoUrl;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// Функция для добавления логотипов к массиву вакансий
async function addLogosToJobs(jobs) {
  console.log(`Adding logos to ${jobs.length} jobs...`);
  
  const jobsWithLogos = await Promise.all(
    jobs.map(async (job) => {
      const logoUrl = await findCompanyLogo(job.company);
      return {
        ...job,
        logoUrl
      };
    })
  );
  
  const jobsWithLogosCount = jobsWithLogos.filter(job => job.logoUrl).length;
  console.log(`Added logos to ${jobsWithLogosCount} out of ${jobs.length} jobs`);
  
  return jobsWithLogos;
}

module.exports = {
  findCompanyLogo,
  addLogosToJobs
};
