/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/duitback-web',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
