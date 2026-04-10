/** @type {import('next').NextConfig} */

const securityHeaders = [
  // NOTE: A proper Content-Security-Policy for Next.js App Router requires
  // nonce-based CSP via middleware (see https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy).
  // A static script-src header without a nonce blocks Next.js's own inline
  // bootstrap scripts and breaks hydration entirely. Omitted until nonce
  // support is implemented.

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
