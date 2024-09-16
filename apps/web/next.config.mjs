/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/lobby',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
