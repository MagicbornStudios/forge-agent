import React from 'react';

const Lazy_button_demo = React.lazy(() => import('./default/example/button-demo').then((m) => ({ default: m.ButtonDemo ?? m.default })));
const Lazy_codebase_agent_strategy_editor = React.lazy(() => import('./default/example/codebase-agent-strategy-editor').then((m) => ({ default: m.CodebaseAgentStrategyEditorExample ?? m.default })));

export const Index = {
  'button-demo': { component: Lazy_button_demo },
  'codebase-agent-strategy-editor': { component: Lazy_codebase_agent_strategy_editor },
} as const;

export type RegistryName = keyof typeof Index;
