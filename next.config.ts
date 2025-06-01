import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';
import { generateSecureNonce } from './src/lib/csp-utils';

const headers = [
  "Accept",
  "Accept-Version",
  "Content-Length",
  "Content-MD5",
  "Content-Type",
  "Date",
  "X-Api-Version",
  "X-CSRF-Token",
  "X-Requested-With",
  "Authorization",
];

const nextConfig = (phase: string): NextConfig => {
  
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    console.log('🚀 Development server starting...');
  }

  const nextConfigOptions: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false, // Disable X-Powered-By header for security
    images: {
      minimumCacheTTL: 2678400, // 31 days
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost",
          port: "3000",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "api.goodlist.chaninkrew.com",
          port: "3000",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "api.goodlist2.chaninkrew.com",
          pathname: "/**",
        },
        {
          protocol: "https",
          hostname: "images.unsplash.com",
          pathname: "/**",
        },
      ],
    },
    async headers() {
      return [
        // CSP and Security Headers for all pages (fallback if middleware doesn't catch)
        {
          source: '/(.*)',
          headers: securityHeadersConfig(phase)
        },
        // Enhanced CORS and CSRF headers for API routes
        {
          source: "/api/(.*)",
          headers: [
            { key: "Access-Control-Allow-Credentials", value: "true" },
            {
              key: "Access-Control-Allow-Origin",
              value: `${process.env.NEXTAUTH_URL }`,
            },
            { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
            { key: "Access-Control-Allow-Headers", value: headers.join(", ") },
            { key: "Access-Control-Max-Age", value: "86400" }, // 24 hours
            // CSRF Protection Headers
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-XSS-Protection", value: "1; mode=block" },
            // Additional security for API routes
            { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
            { key: "Pragma", value: "no-cache" },
            { key: "Expires", value: "0" },
          ],
        },
        // Security headers for redirect responses to prevent information leakage
        {
          source: "/((?!api/).*)",
          headers: [
            { key: "X-Redirect-Security", value: "minimal-response" },
            { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          ],
        },
      ];
    },
    async rewrites() {
      return {
        beforeFiles: [
          // Handle dashboard subdomain for pages
          {
            source: '/:path*',
            has: [
              {
                type: 'host',
                value: 'dashboard.localhost:4200',
              },
            ],
            destination: '/dashboard/:path*',
          },
          // Handle dashboard subdomain for API routes
          {
            source: '/api/:path*',
            has: [
              {
                type: 'host',
                value: 'dashboard.localhost:4200',
              },
            ],
            destination: '/api/dashboard/:path*',
          },
        ],
        afterFiles: [],
        fallback: []
      };
    },
  };

  return nextConfigOptions;
};

const securityHeadersConfig = (phase: string) => {
  
  // Use report-only in development, enforce in production
  const isDevelopment = phase === PHASE_DEVELOPMENT_SERVER;
  
  const cspHeader = () => {
    const nonce = generateSecureNonce();
    
    const upgradeInsecure = (!isDevelopment) ? 'upgrade-insecure-requests;' : '';
    
    // Fallback CSP configuration (when middleware doesn't handle it)
    // Following Next.js documentation recommendations
    const cspDirectives = `
      default-src 'self';
      script-src 'self' 'nonce-${nonce}' ${isDevelopment ? "'unsafe-inline' 'unsafe-eval'" : "'strict-dynamic'"};
      style-src 'self' 'nonce-${nonce}' ${isDevelopment ? "'unsafe-inline'" : ""};
      img-src 'self' data: blob: https://api.goodlist2.chaninkrew.com https://images.unsplash.com;
      font-src 'self' https://fonts.gstatic.com;
      connect-src 'self' https://api.goodlist2.chaninkrew.com ${process.env.NEXT_PUBLIC_BACKEND_URL || ''} ${process.env.NEXTAUTH_URL || ''} ${isDevelopment ? 'ws://localhost:* http://localhost:* https://localhost:* ws://127.0.0.1:* http://127.0.0.1:* https://127.0.0.1:*' : ''};
      media-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      frame-src 'none';
      worker-src 'self' blob:;
      child-src 'self' blob:;
      manifest-src 'self';
      report-to csp-endpoint;
      ${upgradeInsecure}
    `;
    
    // Clean up the CSP string
    return cspDirectives
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  // Security headers for production/preview only
  const extraSecurityHeaders = [];
  
  if (!isDevelopment) {
    extraSecurityHeaders.push({
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains; preload', // 1 year with preload
    });
  }

  const headers = [
    ...extraSecurityHeaders,
    // Report-To header for modern CSP reporting
    {
      key: 'Report-To',
      value: JSON.stringify({
        group: 'csp-endpoint',
        max_age: 86400, // 24 hours
        endpoints: [
          {
            url: '/api/csp-report'
          }
        ]
      })
    },
    // Content Security Policy (fallback configuration)
    {
      key: isDevelopment ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy',
      value: cspHeader(),
    },
    // Enhanced XSS Protection
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block'
    },
    // CSRF Protection Headers
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    // Referrer Policy for privacy
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    // Permissions Policy (formerly Feature Policy)
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()'
    },
    // Cross-Origin Policies
    {
      key: 'Cross-Origin-Opener-Policy',
      value: 'same-origin'
    },
    {
      key: 'Cross-Origin-Resource-Policy',
      value: 'same-origin'
    },
    {
      key: 'Cross-Origin-Embedder-Policy',
      value: 'require-corp'
    },
    // Cache Control for sensitive pages
    {
      key: 'Cache-Control',
      value: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
    },
  ];

  return headers;
};

export default nextConfig;
