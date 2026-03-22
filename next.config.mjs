/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Prevents Next.js/Turbopack from bundling Node-only packages
  serverExternalPackages: ['pdfmake'],

  // External image domains
  images: {
    domains: ['localhost'],
  },

  // Client-side environment variables
  env: {
    APP_NAME: 'SkillMatrix',
    APP_DESCRIPTION: 'College Social Platform for Achievements and Portfolios',
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/feed',
        permanent: false,
      },
    ];
  },

  // Experimental features
  experimental: {
    // Add any experimental features here
  },
};

export default nextConfig;
