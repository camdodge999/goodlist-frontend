import type { NextConfig } from "next";

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
];



const nextConfig: NextConfig = {
  /* config options here */
  // experimental: {
  //   serverComponentsExternalPackages: ['@react-pdf/renderer'],
  // },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.uacj.chaninkrew.com",
        port: "3000",
        pathname: "/**",
      },
    ], // Add 'localhost' to the list of allowed domains
  },
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: `${process.env.NEXT_PUBLIC_NEXTAUTH_URL}`,
          },
          {
            key: "Access-Control-Allow-Origin",
            value: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
          },
          { key: "Access-Control-Allow-Methods", value: "GET,POST" },
          { key: "Access-Control-Allow-Headers", value: headers.join(", ") },
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
        // {
        //   source: '/:path*',
        //   has: [
        //     {
        //       type: 'host',
        //       // value: 'dashboard.uacj.chaninkrew.com:4200',
        //     },
        //   ],
        //   destination: '/dashboard/:path*',
        // },
        // // Handle dashboard subdomain for API routes
        // {
        //   source: '/api/:path*',
        //   has: [
        //     {
        //       type: 'host',
        //       // value: 'dashboard.uacj.chaninkrew.com:4200',
        //     },
        //   ],
        //   destination: '/api/dashboard/:path*',
        // },
      ],
      afterFiles: [],  // Add this empty array
      fallback: []     // Add this empty array
    };
  },
};

export default nextConfig;
