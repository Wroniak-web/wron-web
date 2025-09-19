/** @type {import('next').NextConfig} */
const nextConfig = {
  // Принудительно обновляем статические файлы
  generateEtags: false,
  poweredByHeader: false,
  
  // Настройки для изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Отключаем оптимизацию для внешних изображений
  },
  
  // Настройки для favicon
  async headers() {
    return [
      {
        source: '/favicon.svg',
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
