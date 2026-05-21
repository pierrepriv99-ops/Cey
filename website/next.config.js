/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['cryos.io', 'ipfs.io'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'CryOS',
    NEXT_PUBLIC_APP_URL: 'https://cryos.io',
    NEXT_PUBLIC_SUPPORT_EMAIL: 'support@cryos.io',
  },
};

module.exports = nextConfig;