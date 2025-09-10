/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
        port: "",
        pathname: "/image/**",
      },
      {
        protocol: "https",
        hostname: "share.chartmetric.com",
        port: "",
        pathname: "/artists/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        port: "",
        pathname: "/**",
      },
       {
        protocol: "https",
        hostname: "is1-ssl.mzstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "blacklion-public-s3.s3.us-east-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.deezer.com",
        port: "",
        pathname: "/album/*/image",
      },
    ],
  },
};

module.exports = nextConfig;
