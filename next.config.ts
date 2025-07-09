import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Hanya proses server yang boleh menggunakan modul 'fs'
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        dgram: false,
        cluster: false,
      };
    }

    // // Abaikan modul yang bermasalah
    // config.plugins = config.plugins || [];
    // config.plugins.push(
    //   new config.webpack.IgnorePlugin({
    //     resourceRegExp:
    //       /^(puppeteer-extra|playwright-extra|clone-deep|merge-deep)$/,
    //   })
    // );

    return config;
  },
};

export default nextConfig;
