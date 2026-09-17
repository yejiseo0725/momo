/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // 이미지 5MB와 multipart/form-data 메타데이터 여유분을 허용한다.
      bodySizeLimit: '6mb',
    },
  },
  reactCompiler: true,
  reactStrictMode: true,
  // 개발 서버용 설정
  allowedDevOrigins: ['modumoim.o-r.kr'],
  distDir: process.env.NEXT_DIST_DIR || '.next',
};

export default nextConfig;
