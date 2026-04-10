/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent the browser from guessing the MIME type (stops MIME-sniffing attacks)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Disallow embedding in iframes on other origins (clickjacking protection)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Send a minimal referrer — full URL only on same origin, just origin cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Deny access to camera, mic, geolocation by default
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Force HTTPS for 1 year (only effective when served over HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // Enable XSS filter in older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig = {
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
