/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['example.com'], // Add domains for images that might contain poems
  },
}

module.exports = nextConfig