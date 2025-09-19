/** @type {import('next').NextConfig} */
const nextConfig = {
  // Принудительно обновляем статические файлы
  generateEtags: false,
  poweredByHeader: false,
  
  // Настройки для favicon
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/favicon.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
