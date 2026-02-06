// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"features.md": () => import("../content/docs/features.md?collection=docs"), "getting-started.md": () => import("../content/docs/getting-started.md?collection=docs"), "index.md": () => import("../content/docs/index.md?collection=docs"), "pricing.md": () => import("../content/docs/pricing.md?collection=docs"), }),
};
export default browserCollections;