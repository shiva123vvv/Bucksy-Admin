/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['undici', 'firebase', '@firebase/auth'],
};

module.exports = nextConfig;
