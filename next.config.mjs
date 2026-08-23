/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

export default nextConfig;

const { initOpenNextCloudflareForDev } = await import("@opennextjs/cloudflare");
await initOpenNextCloudflareForDev();
