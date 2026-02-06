import React from 'react';

const Lazy_button_demo = React.lazy(() => import('./default/example/button-demo').then((m) => ({ default: m.ButtonDemo ?? m.default })));

export const Index = {
  'button-demo': { component: Lazy_button_demo },
} as const;

export type RegistryName = keyof typeof Index;