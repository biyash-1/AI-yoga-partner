import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];

     config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,  // Disable fs module for browser
        path: false, // Disable path module for browser
      },
    };
    return config;
  },


};

export default nextConfig;
