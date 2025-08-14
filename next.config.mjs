/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['i.postimg.cc'],
  },
  output: 'standalone',
  trailingSlash: true,
  // Removed problematic rewrites that were causing routing issues
  // async rewrites() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       destination: '/',
  //     },
  //   ];
  // },
}

export default nextConfig
