import type { CollectionConfig } from 'payload';

function validateReactFlowJson(value: unknown): true | string {
  if (typeof value !== 'object' || value === null) return 'flow must be an object';

  const flow = value as any;
  if (!Array.isArray(flow.nodes)) return 'flow.nodes must be an array';
  if (!Array.isArray(flow.edges)) return 'flow.edges must be an array';

  for (const n of flow.nodes) {
    if (!n?.id || typeof n.id !== 'string') return 'Each node must have a string id';
    if (!n?.type || typeof n.type !== 'string') return 'Each node must have a string type';
    if (!n?.position || typeof n.position?.x !== 'number' || typeof n.position?.y !== 'number') {
      return 'Each node must have numeric position {x,y}';
    }
  }

  for (const e of flow.edges) {
    if (!e?.id || typeof e.id !== 'string') return 'Each edge must have a string id';
    if (!e?.source || typeof e.source !== 'string') return 'Each edge must have a string source';
    if (!e?.target || typeof e.target !== 'string') return 'Each edge must have a string target';
  }

  return true;
}

export const ForgeGraphs: CollectionConfig = {
  slug: 'forge-graphs',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      index: true,
    },
    {
      name: 'kind',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Narrative', value: 'NARRATIVE' },
        { label: 'Storylet', value: 'STORYLET' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'flow',
      type: 'json',
      required: true,
      validate: (value) => validateReactFlowJson(value),
    },
  ],
};
