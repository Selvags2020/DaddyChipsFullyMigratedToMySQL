/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true, // Add this line
  images: {
    domains: ['res.cloudinary.com'],
    unoptimized: true, // Required for static export
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/products/all/',
        permanent: false,
      }
    ];
  }
};

export default nextConfig;