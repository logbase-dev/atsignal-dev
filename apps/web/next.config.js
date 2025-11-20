/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 모드에서는 output: 'export' 제거 (동적 라우트 정상 작동)
  // 빌드 시에만 적용 (정적 사이트 생성)
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;

