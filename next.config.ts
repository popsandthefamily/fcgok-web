import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking — only allow your site to frame itself
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Block MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Control referrer info sent to other sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Restrict browser features (camera, mic, geolocation, etc.)
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Force HTTPS for 1 year, including subdomains
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
  // XSS protection for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Content Security Policy
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://formspree.io",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://formspree.io",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://formspree.io",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
