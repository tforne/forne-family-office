/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2xsxph8kpxj0f.cloudfront.net',
      },
    ],
  },
};

export default nextConfig;
