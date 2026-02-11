import type { Payload } from 'payload';

const DEFAULT_ADMIN = {
  email: process.env.SEED_ADMIN_EMAIL ?? 'admin@forge.local',
  password: process.env.SEED_ADMIN_PASSWORD ?? 'admin12345',
  name: 'Forge Admin',
  role: 'admin',
  plan: 'pro',
};

const DEFAULT_USER = {
  email: process.env.SEED_USER_EMAIL ?? 'user@forge.local',
  password: process.env.SEED_USER_PASSWORD ?? 'user12345',
  name: 'Forge User',
  role: 'user',
  plan: 'free',
};

const DEMO_NARRATIVE_GRAPH_TITLE = 'Demo Narrative';
const DEMO_STORYLET_GRAPH_TITLE = 'Demo Storylet';
const DEMO_PROJECT_SLUG = 'demo-project';

const demoFlow = {
  nodes: [
    {
      id: 'start',
      type: 'CHARACTER',
      position: { x: 0, y: 0 },
      data: { label: 'Start', speaker: 'Narrator', content: 'Welcome to Forge.' },
    },
  ],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

async function ensureUser(payload: Payload, data: typeof DEFAULT_ADMIN) {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: data.email } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0];
  return payload.create({
    collection: 'users',
    data: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role as 'user' | 'admin',
      plan: data.plan as 'free' | 'pro',
    },
  });
}

async function ensureGraph(
  payload: Payload,
  projectId: string | number,
  kind: 'NARRATIVE' | 'STORYLET',
  title: string,
) {
  const existing = await payload.find({
    collection: 'forge-graphs',
    where: {
      and: [
        { project: { equals: projectId } },
        { kind: { equals: kind } },
      ],
    },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0];
  return payload.create({
    collection: 'forge-graphs',
    data: {
      title,
      kind,
      project: projectId as number,
      flow: demoFlow,
    },
  });
}

async function ensureProject(payload: Payload, ownerId: string | number) {
  const existingOwner = Number(ownerId);
  const existing = await payload.find({
    collection: 'projects',
    where: { slug: { equals: DEMO_PROJECT_SLUG } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0];
  return payload.create({
    collection: 'projects',
    data: {
      title: 'Demo Project',
      slug: DEMO_PROJECT_SLUG,
      description: 'Seeded demo project for Forge.',
      domain: 'forge',
      status: 'active',
      owner: existingOwner,
    },
  });
}

async function ensurePersonalOrganization(payload: Payload, userId: number, name: string) {
  const existingMembership = await payload.find({
    collection: 'organization-memberships',
    where: { user: { equals: userId } },
    depth: 1,
    limit: 1,
  });

  if (existingMembership.docs.length > 0) {
    const organization = existingMembership.docs[0].organization;
    if (typeof organization === 'object' && organization != null && 'id' in organization) {
      return Number((organization as { id: number }).id);
    }
    if (organization != null) return Number(organization);
  }

  const normalizedName = name.trim().length > 0 ? name : `User ${userId}`;
  const organization = await payload.create({
    collection: 'organizations',
    data: {
      name: `${normalizedName} Workspace`,
      slug: `${normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${userId}`,
      owner: userId,
    },
    overrideAccess: true,
  });

  await payload.create({
    collection: 'organization-memberships',
    data: {
      organization: organization.id,
      user: userId,
      role: 'owner',
    },
    overrideAccess: true,
  });

  await payload.update({
    collection: 'users',
    id: userId,
    data: {
      defaultOrganization: organization.id,
    },
    overrideAccess: true,
  });

  return organization.id as number;
}

const SEED_PROMOTION_TITLE = 'Welcome to Forge';

async function ensurePromotion(payload: Payload) {
  const existing = await payload.find({
    collection: 'promotions',
    where: { title: { equals: SEED_PROMOTION_TITLE } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0];
  return payload.create({
    collection: 'promotions',
    data: {
      title: SEED_PROMOTION_TITLE,
      active: true,
      ctaUrl: '/docs',
    },
  });
}

const SEED_WAITLIST_EMAIL = 'seed@forge.local';

async function ensureWaitlistEntry(payload: Payload) {
  const existing = await payload.find({
    collection: 'waitlist',
    where: { email: { equals: SEED_WAITLIST_EMAIL } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0];
  return payload.create({
    collection: 'waitlist',
    data: {
      email: SEED_WAITLIST_EMAIL,
      name: 'Seed Waitlist',
      source: 'seed',
    },
  });
}

async function ensureNewsletterEntry(payload: Payload) {
  const existing = await payload.find({
    collection: 'newsletter-subscribers',
    where: { email: { equals: SEED_WAITLIST_EMAIL } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0];
  return payload.create({
    collection: 'newsletter-subscribers',
    data: {
      email: SEED_WAITLIST_EMAIL,
      optedIn: true,
      source: 'seed',
    },
  });
}

const SEED_POST_SLUG = 'shadcn-mcp-and-registries';

const seedPostBody = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            format: 0,
            mode: 'normal',
            style: '',
            text: 'Using the shadcn MCP server lets the AI browse and install shadcn-compatible components from the default registry and from your configured registries without leaving the editor.',
            version: 1,
          },
        ],
        direction: 'ltr',
        textFormat: 0,
      },
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            format: 0,
            mode: 'normal',
            style: '',
            text: 'You can browse and search components across registries, install with natural language (e.g. "add a login form", "add the Magic UI hero"), and keep marketing UI in sync with the shadcn directory and MCP docs.',
            version: 1,
          },
        ],
        direction: 'ltr',
        textFormat: 0,
      },
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [
          {
            type: 'text',
            format: 0,
            mode: 'normal',
            style: '',
            text: 'We set this up with one MCP config at repo root (with cwd pointing at the marketing app), registries added in components.json (@magicui, @aceternity, @tailark, @shadcnblocks), and npx so no local shadcn install is required. Good use cases: add base components into marketing, show hero sections from a registry and install them, find pricing sections and install, and keep design consistent across pages.',
            version: 1,
          },
        ],
        direction: 'ltr',
        textFormat: 0,
      },
    ],
    direction: 'ltr',
  },
};

async function ensureFirstBlogPost(payload: Payload) {
  const existing = await payload.find({
    collection: 'posts',
    where: { slug: { equals: SEED_POST_SLUG } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0];
  return payload.create({
    collection: 'posts',
    data: {
      title: 'Setting up the shadcn MCP server and component registries',
      slug: SEED_POST_SLUG,
      excerpt:
        'How we configured the shadcn MCP server and registries so the AI can browse and install components into the marketing app.',
      body: seedPostBody as never,
      publishedAt: new Date().toISOString(),
      status: 'published',
    },
  });
}

export async function seedStudio(payload: Payload) {
  try {
    const admin = await ensureUser(payload, DEFAULT_ADMIN);
    const basicUser = await ensureUser(payload, DEFAULT_USER);
    const adminOrgId = await ensurePersonalOrganization(payload, Number(admin.id), admin.name ?? 'Admin');
    await ensurePersonalOrganization(payload, Number(basicUser.id), basicUser.name ?? 'User');
    const project = await ensureProject(payload, admin.id);
    if (!project.organization) {
      await payload.update({
        collection: 'projects',
        id: project.id,
        data: { organization: adminOrgId },
      });
    }
    const narrative = await ensureGraph(
      payload,
      project.id,
      'NARRATIVE',
      DEMO_NARRATIVE_GRAPH_TITLE,
    );
    await ensureGraph(
      payload,
      project.id,
      'STORYLET',
      DEMO_STORYLET_GRAPH_TITLE,
    );
    if (!project.forgeGraph) {
      await payload.update({
        collection: 'projects',
        id: project.id,
        data: { forgeGraph: narrative.id },
      });
    }
    await ensurePromotion(payload);
    await ensureWaitlistEntry(payload);
    await ensureNewsletterEntry(payload);
    await ensureFirstBlogPost(payload);
    payload.logger.info('[Seed] Studio seed complete');
  } catch (err) {
    payload.logger.error(`[Seed] Failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
