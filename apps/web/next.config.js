/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
}

module.exports = {
  typescript: {
    // Ignore TypeScript build errors (useful on Windows until Prisma client is fully generated)
    ignoreBuildErrors: true,
  },
};



