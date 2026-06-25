const withNextIntl = require('next-intl/plugin')('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['pb.fullwork.pl', 'fullwork.pl', 'images.pexels.com'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'www.pexels.com' },
      { protocol: 'https', hostname: 'pexels.com' },
      { protocol: 'https', hostname: 'pb.fullwork.pl' },
      { protocol: 'https', hostname: 'pb.fullwork.pl', port: '', pathname: '/api/files/**' },
      { protocol: 'https', hostname: 'fullwork.pl' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Forzar barra final para evitar conflictos con el CMS estático
  trailingSlash: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://www.inteligentnefolie.pl https://inteligentnefolie.pl http://localhost:* http://127.0.0.1:* http://localhost:3000 http://localhost:3001 http://localhost:5173 http://localhost:5174 http://localhost:3800 http://127.0.0.1:5173 http://127.0.0.1:5174",
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade',
          },
        ],
      },
      {
        source: '/api/revalidate',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      {
        // Si la ruta empieza por /panel/ y no es un archivo real, servir index.html
        source: '/panel/:path*',
        destination: '/panel/index.html',
      },
    ]
  },
}

module.exports = withNextIntl(nextConfig)
