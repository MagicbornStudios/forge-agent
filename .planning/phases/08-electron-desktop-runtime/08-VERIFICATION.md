---
phase: 08-electron-desktop-runtime
verified: 2026-02-17T02:48:14.243Z
status: human_needed
score: 0/8
---

# Phase 08: Electron desktop runtime Verification Report

**Phase Goal:** Provide Electron runtime with bundled SQLite and native watcher-first repository refresh behavior.
**Status:** human_needed

## Automated Checks

| Check | Status | Details |
|---|---|---|
| pnpm docs:platform:doctor | PASS | > forge-agent@ docs:platform:doctor C:\Users\benja\Documents\forge-agent
> node scripts/platform-docs-doctor.mjs

[platform-docs-doctor] PASS |
| pnpm docs:showcase:doctor | PASS | > forge-agent@ docs:showcase:doctor C:\Users\benja\Documents\forge-agent
> node scripts/showcase-doctor.mjs

[showcase-doctor] PASS |
| pnpm docs:runtime:doctor | PASS | > forge-agent@ docs:runtime:doctor C:\Users\benja\Documents\forge-agent
> node scripts/docs-runtime-doctor.mjs

[docs-runtime-doctor] PASS: docs runtime guardrails satisfied |
| pnpm --filter @forge/studio build | PASS | ⚠ Compiled with warnings in 45s

../../node_modules/.pnpm/payload@3.74.0_graphql@16.12.0_typescript@5.9.3/node_modules/payload/dist/utilities/dynamicImport.js
Critical dependency: the request of a dependency is an expression

Import trace for requested module:
../../node_modules/.pnpm/payload@3.74.0_graphql@16.12.0_typescript@5.9.3/node_modules/payload/dist/utilities/dynamicImport.js
../../node_modules/.pnpm/payload@3.74.0_graphql@16.12.0_typescript@5.9.3/node_modules/payload/dist/index.js
./app/api/catalog/route.ts

Failed to load undo-redo state from localStorage: ReferenceError: localStorage is not defined
    at aq (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96152)
    at <unknown> (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96404)
    at ar (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96386)
Failed to load undo-redo state from localStorage: ReferenceError: localStorage is not defined
    at aq (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96152)
    at <unknown> (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96404)
    at ar (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96386)
Failed to load undo-redo state from localStorage: ReferenceError: localStorage is not defined
    at aq (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96152)
    at <unknown> (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96404)
    at ar (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96386) |
| pnpm --filter @forge/studio test -- --runInBand | PASS | PASS __tests__/assistant-runtime.test.ts
PASS __tests__/settings/settings-codegen.test.tsx
  ● Console

    console.error
      react-test-renderer is deprecated. See https://react.dev/warnings/react-test-renderer

    [0m [90m 84 |[39m
     [90m 85 |[39m     [33mTestRenderer[39m[33m.[39mact(() [33m=>[39m {
    [31m[1m>[22m[39m[90m 86 |[39m       [33mTestRenderer[39m[33m.[39mcreate([33m<[39m[33mTree[39m [33m/[39m[33m>[39m)[33m;[39m
     [90m    |[39m                    [31m[1m^[22m[39m
     [90m 87 |[39m     })[33m;[39m
     [90m 88 |[39m
     [90m 89 |[39m     [36mconst[39m sections [33m=[39m useSettingsRegistryStore[33m.[39mgetState()[33m.[39msections[33m;[39m[0m

      at Object.<anonymous>.process.env.NODE_ENV.exports.create (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:17337:17)
      at create (__tests__/settings/settings-codegen.test.tsx:86:20)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:814:22)
      at Object.act (__tests__/settings/settings-codegen.test.tsx:85:18)

    console.error
      The current testing environment is not configured to support act(...)

    [0m [90m 84 |[39m
     [90m 85 |[39m     [33mTestRenderer[39m[33m.[39mact(() [33m=>[39m {
    [31m[1m>[22m[39m[90m 86 |[39m       [33mTestRenderer[39m[33m.[39mcreate([33m<[39m[33mTree[39m [33m/[39m[33m>[39m)[33m;[39m
     [90m    |[39m                    [31m[1m^[22m[39m
     [90m 87 |[39m     })[33m;[39m
     [90m 88 |[39m
     [90m 89 |[39m     [36mconst[39m sections [33m=[39m useSettingsRegistryStore[33m.[39mgetState()[33m.[39msections[33m;[39m[0m

      at isConcurrentActEnvironment (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11999:17)
      at warnIfUpdatesNotWrappedWithActDEV (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:14399:7)
      at scheduleUpdateOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12086:9)
      at updateContainerImpl (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:14984:9)
      at updateContainer (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:14927:7)
      at Object.<anonymous>.process.env.NODE_ENV.exports.create (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:17369:7)
      at create (__tests__/settings/settings-codegen.test.tsx:86:20)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:814:22)
      at Object.act (__tests__/settings/settings-codegen.test.tsx:85:18)

    console.error
      The current testing environment is not configured to support act(...)

      at isConcurrentActEnvironment (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11999:17)
      at warnIfUpdatesNotWrappedWithActDEV (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:14399:7)
      at scheduleUpdateOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12086:9)
      at dispatchSetStateInternal (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6208:13)
      at dispatchSetState (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6165:7)
      at ../../node_modules/.pnpm/@radix-ui+react-presence@1.1.5_@types+react-dom@19.2.3_@types+react@19.2.11__@types+react@19._pa7phbmv7vclolbk32r5igcvi4/node_modules/@radix-ui/react-presence/src/presence.tsx:159:7
      at setRef (../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:11:12)
      at ../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:25:23
          at Array.map (<anonymous>)
      at ../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:24:27
      at commitAttachRef (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:9763:44)
      at runWithFiberInDEV (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:2315:13)
      at safelyAttachRef (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:9781:9)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10142:26)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10087:11)
      at flushLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:13774:15)
      at commitRoot (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:13697:9)
      at performWorkOnRoot (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12336:15)
      at performWorkOnRootViaSchedulerTask (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:2908:7)
      at flushActQueue (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:590:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:884:10)

    console.error
      The current testing environment is not configured to support act(...)

      at isConcurrentActEnvironment (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11999:17)
      at warnIfUpdatesNotWrappedWithActDEV (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:14399:7)
      at scheduleUpdateOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12086:9)
      at dispatchSetStateInternal (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6208:13)
      at dispatchSetState (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6165:7)
      at ../../node_modules/.pnpm/@radix-ui+react-presence@1.1.5_@types+react-dom@19.2.3_@types+react@19.2.11__@types+react@19._pa7phbmv7vclolbk32r5igcvi4/node_modules/@radix-ui/react-presence/src/presence.tsx:159:7
      at setRef (../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:11:12)
      at ../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:25:23
          at Array.map (<anonymous>)
      at ../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:24:27
      at commitAttachRef (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:9763:44)
      at runWithFiberInDEV (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:2315:13)
      at safelyAttachRef (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:9781:9)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10142:26)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10087:11)
      at flushLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:13774:15)
      at commitRoot (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:13697:9)
      at performWorkOnRoot (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12336:15)
      at performWorkOnRootViaSchedulerTask (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:2908:7)
      at flushActQueue (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:590:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:884:10)

    console.error
      The current testing environment is not configured to support act(...)

      at isConcurrentActEnvironment (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11999:17)
      at warnIfUpdatesNotWrappedWithActDEV (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:14399:7)
      at scheduleUpdateOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12086:9)
      at dispatchSetStateInternal (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6208:13)
      at dispatchSetState (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6165:7)
      at ../../node_modules/.pnpm/@radix-ui+react-presence@1.1.5_@types+react-dom@19.2.3_@types+react@19.2.11__@types+react@19._pa7phbmv7vclolbk32r5igcvi4/node_modules/@radix-ui/react-presence/src/presence.tsx:159:7
      at setRef (../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:11:12)
      at ../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:25:23
          at Array.map (<anonymous>)
      at ../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:24:27
      at commitAttachRef (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:9763:44)
      at runWithFiberInDEV (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:2315:13)
      at safelyAttachRef (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:9781:9)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10142:26)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10087:11)
      at flushLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:13774:15)
      at commitRoot (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:13697:9)
      at performWorkOnRoot (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12336:15)
      at performWorkOnRootViaSchedulerTask (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:2908:7)
      at flushActQueue (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:590:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:884:10)

    console.error
      The current testing environment is not configured to support act(...)

      at isConcurrentActEnvironment (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11999:17)
      at warnIfUpdatesNotWrappedWithActDEV (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:14399:7)
      at scheduleUpdateOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12086:9)
      at dispatchSetStateInternal (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6208:13)
      at dispatchSetState (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6165:7)
      at ../../node_modules/.pnpm/@radix-ui+react-presence@1.1.5_@types+react-dom@19.2.3_@types+react@19.2.11__@types+react@19._pa7phbmv7vclolbk32r5igcvi4/node_modules/@radix-ui/react-presence/src/presence.tsx:159:7
      at setRef (../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:11:12)
      at ../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:25:23
          at Array.map (<anonymous>)
      at ../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:24:27
      at commitAttachRef (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:9763:44)
      at runWithFiberInDEV (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:2315:13)
      at safelyAttachRef (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:9781:9)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10142:26)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10087:11)
      at flushLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:13774:15)
      at commitRoot (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:13697:9)
      at performWorkOnRoot (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12336:15)
      at performWorkOnRootViaSchedulerTask (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:2908:7)
      at flushActQueue (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:590:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:884:10)

    console.error
      The current testing environment is not configured to support act(...)

      at isConcurrentActEnvironment (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:11999:17)
      at warnIfUpdatesNotWrappedWithActDEV (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:14399:7)
      at scheduleUpdateOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12086:9)
      at dispatchSetStateInternal (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6208:13)
      at dispatchSetState (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:6165:7)
      at ../../node_modules/.pnpm/@radix-ui+react-presence@1.1.5_@types+react-dom@19.2.3_@types+react@19.2.11__@types+react@19._pa7phbmv7vclolbk32r5igcvi4/node_modules/@radix-ui/react-presence/src/presence.tsx:159:7
      at setRef (../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:11:12)
      at ../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:25:23
          at Array.map (<anonymous>)
      at ../../node_modules/.pnpm/@radix-ui+react-compose-refs@1.1.2_@types+react@19.2.11_react@19.2.4/node_modules/@radix-ui/react-compose-refs/src/compose-refs.tsx:24:27
      at commitAttachRef (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:9763:44)
      at runWithFiberInDEV (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:2315:13)
      at safelyAttachRef (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:9781:9)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10142:26)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10118:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10210:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10005:11)
      at recursivelyTraverseLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10892:11)
      at commitLayoutEffectOnFiber (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:10087:11)
      at flushLayoutEffects (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:13774:15)
      at commitRoot (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:13697:9)
      at performWorkOnRoot (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:12336:15)
      at performWorkOnRootViaSchedulerTask (../../node_modules/.pnpm/react-test-renderer@19.2.4_react@19.2.4/node_modules/react-test-renderer/cjs/react-test-renderer.development.js:2908:7)
      at flushActQueue (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:590:34)
      at Object.<anonymous>.process.env.NODE_ENV.exports.act (../../node_modules/.pnpm/react@19.2.4/node_modules/react/cjs/react.development.js:884:10)

PASS __tests__/model-router/server-state.test.ts
PASS __tests__/model-router/responses-compat.test.ts
PASS __tests__/character/media-meta.test.ts
PASS __tests__/model-router/selection.test.ts

Test Suites: 6 passed, 6 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        2.703 s, estimated 3 s
Ran all test suites. |
| pnpm forge-loop:test | PASS | > forge-agent@ forge-loop:test C:\Users\benja\Documents\forge-agent
> pnpm --filter @forge/forge-loop test


> @forge/forge-loop@0.1.0 test C:\Users\benja\Documents\forge-agent\packages\forge-loop
> node --test "src/__tests__/*.test.mjs"

✔ required package runbooks exist (9.8529ms)
✔ package.json includes docs and readme in published files (0.7834ms)
✔ package docs and generated prompt templates are agent-agnostic (11.3278ms)
✔ doctor validates planning artifacts and reports next action (471.7823ms)
✔ headless env gate runs only when headless flag is set (2.326ms)
✔ headless env gate respects env enabled and enforce flags (0.4249ms)
✔ execute-phase summary upserts tasks and remains idempotent on rerun (1654.4373ms)
✔ commit message formatters follow contract (2.0127ms)
✔ commitPaths skips when repository is not git (71.7977ms)
✔ commitPaths skips when no tracked changes are present (624.4747ms)
✔ isInCommitScope matches allowed glob patterns (0.7708ms)
✔ commitPaths blocks out-of-scope files when commitScope is set (231.95ms)
✔ commitPaths blocks staged files outside commit scope (362.6967ms)
✔ assertCommitResult throws on failed commit result (0.7052ms)
✔ parseStatusSections returns expected heading sections (2.3217ms)
✔ parseRalphDoneItems returns only done bullet lines (2.5285ms)
✔ parseNextItems parses bold and non-bold numbered lines (1.0286ms)
✔ parseTaskRegistryInitiatives parses markdown table rows (0.6488ms)
✔ buildMigrationWarnings reports missing key inputs (0.5451ms)
✔ loop:new creates loop scaffold and loop:use + --loop drive progress routing (852.2981ms)
✔ updateGeneratedBlock injects generated section when markers are missing (3.9723ms)
✔ updateGeneratedBlock only replaces marker section and is idempotent (2.7535ms)
✔ new-project migrates legacy docs into .planning tree (254.3164ms)
✔ new-project on existing .planning reports guidance and does not overwrite (324.8719ms)
✔ new-project supports forge-loop profile (167.9636ms)
✔ new-project accepts generic as deprecated alias for forge-loop (156.6592ms)
✔ new-project supports custom profile with forge-loop verification baseline (149.7063ms)
✔ plan-phase creates plan files with required frontmatter fields (451.5816ms)
✔ sync-legacy respects legacySync.enabled flag (364.8121ms)
✔ validatePlanFrontmatter accepts required schema (5.7148ms)
✔ validatePlanFrontmatter fails missing required schema fields (0.7418ms)
✔ parsePlanFrontmatterYaml returns typed values (0.589ms)
✔ validateWaveOrdering checks dependency graph and wave ordering (0.7442ms)
✔ parsePlanWave reads wave from frontmatter (0.6198ms)
✔ buildVerificationCommandPlan selects matrix commands by changed paths (2.1862ms)
✔ buildVerificationCommandPlan supports forge-loop profile (1.8629ms)
✔ verify-work emits expected check matrix in command output (3556.5614ms)
✔ verify-work --strict exits non-zero when checks fail (2057.9884ms)
ℹ tests 38
ℹ suites 0
ℹ pass 38
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5965.5303 |

## UAT Truths

| # | Truth | Status | Notes |
|---|---|---|---|
| 1 | Electron runtime shell must align to analysis contracts in .planning/ANALYSIS-REFERENCES.md. | SKIPPED | Skipped in non-interactive mode. |
| 2 | Outputs must keep Forge Loop artifacts traceable and deterministic for repeat runs. | SKIPPED | Skipped in non-interactive mode. |
| 3 | SQLite path strategy must align to analysis contracts in .planning/ANALYSIS-REFERENCES.md. | SKIPPED | Skipped in non-interactive mode. |
| 4 | Outputs must keep Forge Loop artifacts traceable and deterministic for repeat runs. | SKIPPED | Skipped in non-interactive mode. |
| 5 | Native watcher integration must align to analysis contracts in .planning/ANALYSIS-REFERENCES.md. | SKIPPED | Skipped in non-interactive mode. |
| 6 | Outputs must keep Forge Loop artifacts traceable and deterministic for repeat runs. | SKIPPED | Skipped in non-interactive mode. |
| 7 | Desktop packaging and release scripts must align to analysis contracts in .planning/ANALYSIS-REFERENCES.md. | SKIPPED | Skipped in non-interactive mode. |
| 8 | Outputs must keep Forge Loop artifacts traceable and deterministic for repeat runs. | SKIPPED | Skipped in non-interactive mode. |

## Gap Summary

- No blocking gaps found.
