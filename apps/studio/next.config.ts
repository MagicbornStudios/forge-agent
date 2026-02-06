import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@forge/shared", "@forge/domain-forge", "@forge/types", "@forge/ui", "@forge/agent-engine"],
  experimental: {
    reactCompiler: false,
  },
};

const withMDX = createMDX();
export default withPayload(withMDX(nextConfig));
