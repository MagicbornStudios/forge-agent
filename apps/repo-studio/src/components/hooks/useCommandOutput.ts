'use client';

import * as React from 'react';

const INITIAL_OUTPUT = 'No command run yet.';

export function useCommandOutput() {
  const [commandOutput, setCommandOutput] = React.useState(INITIAL_OUTPUT);
  return { commandOutput, setCommandOutput };
}
