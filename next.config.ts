import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ===========================================
  // Image Configuration
  // ===========================================
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Google Images (for SerpAPI results)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "maps.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "streetviewpixels-pa.googleapis.com",
      },
      // Booking.com images
      {
        protocol: "https",
        hostname: "cf.bstatic.com",
      },
      {
        protocol: "https",
        hostname: "q-xx.bstatic.com",
      },
      // Agoda images
      {
        protocol: "https",
        hostname: "pix8.agoda.net",
      },
      {
        protocol: "https",
        hostname: "pix10.agoda.net",
      },
      // Wikipedia/Wikimedia images
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "wikipedia.org",
      },
      {
        protocol: "https",
        hostname: "selangor.travel",
      },
      {
        protocol: "https",
        hostname: "pokokkelapa.wordpress.com",
      },
    ],
  },

  // ===========================================
  // Security Headers
  // ===========================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent DNS prefetching
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          // Force HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()'
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          }
        ],
      },
    ];
  },

  // ===========================================
  // Production Build Optimizations
  // ===========================================

  // Remove console.logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep error and warn logs
    } : false,
  },

  // Disable source maps in production (security)
  productionBrowserSourceMaps: false,

  // Output configuration for deployment
  output: 'standalone',

  // ===========================================
  // Performance & Optimization
  // ===========================================

  // Enable React strict mode
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Power off header (security)
  poweredByHeader: false,

  // ===========================================
  // Experimental Features (Optional)
  // ===========================================
  experimental: {
    // Server actions for better security
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;

