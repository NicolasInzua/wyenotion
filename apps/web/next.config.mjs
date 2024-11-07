/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // transpilePackages: ['@slate-yjs/react'],
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
