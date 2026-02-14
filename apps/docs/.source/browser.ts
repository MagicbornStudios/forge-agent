// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.md": () => import("../content/docs/index.md?collection=docs"), "components/index.mdx": () => import("../content/docs/components/index.mdx?collection=docs"), "components/showcase/atoms.mdx": () => import("../content/docs/components/showcase/atoms.mdx?collection=docs"), "components/showcase/molecules.mdx": () => import("../content/docs/components/showcase/molecules.mdx?collection=docs"), "components/showcase/organisms.mdx": () => import("../content/docs/components/showcase/organisms.mdx?collection=docs"), }),
};
export default browserCollections;