const { withContentCollections } = require('@content-collections/next');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** Compile-time: bangun CSP dengan 'unsafe-eval' hanya di dev */
const scriptSrc =
  process.env.NODE_ENV === 'development'
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com"
    : "'self' 'unsafe-inline' https://static.cloudflareinsights.com";

const ContentSecurityPolicy = `
  default-src 'self';
  connect-src 'self' https://api.hmtc-its.com;
  script-src ${scriptSrc};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  object-src 'none';
  base-uri 'self';
  frame-src https://www.youtube.com https://www.youtube-nocookie.com;
  frame-ancestors 'self';
  manifest-src 'self';
`
  .replace(/\s{2,}/g, ' ')
  .trim();

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' },
  {
    key: 'Permissions-Policy',
    value: 'accelerometer=(), camera=(), gyroscope=(), microphone=(), usb=()',
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Build as a standalone app so Next produces `.next/standalone` for minimal runtime
  output: 'standalone',

  compiler: {
    styledComponents: true,
    removeConsole: process.env.NODE_ENV === 'production',
  },

  /** Hanya pasang security headers di production, skip di dev */
  async headers() {
    if (process.env.NODE_ENV === 'production') {
      return [{ source: '/(.*)', headers: securityHeaders }];
    }
    return [];
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: [
          {
            loader: '@svgr/webpack',
            options: {
              prettier: false,
              svgo: true,
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
              titleProp: true,
              ref: true,
            },
          },
        ],
        as: '*.js',
      },
    },
  },

  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflareinsights.com',
      },
    ],
  },
};

module.exports = withContentCollections(nextConfig);
