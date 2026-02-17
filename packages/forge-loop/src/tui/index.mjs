import React from 'react';
import { render } from 'ink';

import { InteractiveLoopApp } from './app.mjs';

export async function runInteractiveTui(input) {
  return new Promise((resolve) => {
    const instance = render(
      React.createElement(InteractiveLoopApp, {
        ...input,
        onDone: (result) => {
          resolve(result);
        },
      }),
    );

    input.onExit?.(() => {
      instance.unmount();
    });
  });
}
