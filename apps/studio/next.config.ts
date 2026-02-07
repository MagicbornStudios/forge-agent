import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { createMDX } from "fumadocs-mdx/next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: [
    "@forge/shared",
    "@forge/domain-forge",
    "@forge/domain-character",
    "@forge/types",
    "@forge/ui",
    "@forge/agent-engine",
    "@twick/studio",
    "@twick/timeline",
    "@twick/live-player",
    "@twick/video-editor",
    "@twick/canvas",
  ],
  experimental: {
    reactCompiler: false,
  },
};

const withMDX = createMDX();
export default withPayload(withMDX(nextConfig));
