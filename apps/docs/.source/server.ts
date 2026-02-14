// @ts-nocheck
import * as __fd_glob_7 from "../content/docs/components/showcase/organisms.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/components/showcase/molecules.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/components/showcase/atoms.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/components/index.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/index.md?collection=docs"
import { default as __fd_glob_2 } from "../content/docs/components/showcase/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/components/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, "components/meta.json": __fd_glob_1, "components/showcase/meta.json": __fd_glob_2, }, {"index.md": __fd_glob_3, "components/index.mdx": __fd_glob_4, "components/showcase/atoms.mdx": __fd_glob_5, "components/showcase/molecules.mdx": __fd_glob_6, "components/showcase/organisms.mdx": __fd_glob_7, });