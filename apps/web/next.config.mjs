/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => {
    return [
      {
        source: '/:slug',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
