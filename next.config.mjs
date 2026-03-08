/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // unoptimized: true, // 성능 최적화를 위해 비활성화 (Next.js 이미지 최적화 사용)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
