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

const DEMO_GRAPH_TITLE = 'Demo Graph';
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

async function ensureGraph(payload: Payload) {
  const existing = await payload.find({
    collection: 'forge-graphs',
    where: { title: { equals: DEMO_GRAPH_TITLE } },
    limit: 1,
  });
  if (existing.docs.length > 0) return existing.docs[0];
  return payload.create({
    collection: 'forge-graphs',
    data: {
      title: DEMO_GRAPH_TITLE,
      flow: demoFlow,
    },
  });
}

async function ensureProject(payload: Payload, ownerId: string | number, graphId: string | number) {
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
      owner: ownerId as number,
      forgeGraph: graphId as number,
    },
  });
}

export async function seedStudio(payload: Payload) {
  try {
    const admin = await ensureUser(payload, DEFAULT_ADMIN);
    await ensureUser(payload, DEFAULT_USER);
    const graph = await ensureGraph(payload);
    await ensureProject(payload, admin.id, graph.id);
    payload.logger.info('[Seed] Studio seed complete');
  } catch (err) {
    payload.logger.error(`[Seed] Failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
