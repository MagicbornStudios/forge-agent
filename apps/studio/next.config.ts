import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@forge/shared", "@forge/domain-forge", "@forge/types", "@forge/ui", "@forge/agent-engine"],
  experimental: {
    reactCompiler: false,
  },
};

export default withPayload(nextConfig);
