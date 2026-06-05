import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

function buildContentSecurityPolicy(): string {
  const scriptSrc = isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' https: data:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-src 'self' https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
}

const baseSecurityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: buildContentSecurityPolicy() },
];

/** 공유 페이지: 외부 링크·분석에 토큰이 Referer로 새지 않도록 */
const shareSecurityHeaders = baseSecurityHeaders.map((h) =>
  h.key === 'Referrer-Policy' ? { key: 'Referrer-Policy', value: 'no-referrer' } : h,
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  /** monorepo/상위 lockfile 때문에 API 라우트가 배포에서 빠지는 것 방지 */
  outputFileTracingRoot: projectRoot,
  async headers() {
    return [
      { source: '/s/:path*', headers: shareSecurityHeaders },
      { source: '/f/:path*', headers: shareSecurityHeaders },
      { source: '/:path*', headers: baseSecurityHeaders },
    ];
  },
};

export default nextConfig;
