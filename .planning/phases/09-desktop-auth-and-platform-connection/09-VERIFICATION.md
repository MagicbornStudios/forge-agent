---
phase: 09-desktop-auth-and-platform-connection
verified: 2026-02-17T04:12:44.307Z
status: human_needed
score: 0/12
---

# Phase 09: Desktop auth and platform connection Verification Report

**Phase Goal:** Secure desktop connection to platform APIs with scoped auth and local credential lifecycle.
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
| pnpm --filter @forge/studio build | PASS | ⚠ Compiled with warnings in 38.3s

../../node_modules/.pnpm/payload@3.74.0_graphql@16.12.0_typescript@5.9.3/node_modules/payload/dist/utilities/dynamicImport.js
Critical dependency: the request of a dependency is an expression

Import trace for requested module:
../../node_modules/.pnpm/payload@3.74.0_graphql@16.12.0_typescript@5.9.3/node_modules/payload/dist/utilities/dynamicImport.js
../../node_modules/.pnpm/payload@3.74.0_graphql@16.12.0_typescript@5.9.3/node_modules/payload/dist/index.js
./app/api/catalog/[id]/clone/route.ts

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
PASS __tests__/character/media-meta.test.ts
PASS __tests__/model-router/responses-compat.test.ts
PASS __tests__/repo-studio-desktop-auth.test.ts
PASS __tests__/model-router/selection.test.ts

Test Suites: 7 passed, 7 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        3.534 s, estimated 4 s
Ran all test suites. |
| pnpm forge-loop:test | PASS | > forge-agent@ forge-loop:test C:\Users\benja\Documents\forge-agent
> pnpm --filter @forge/forge-loop test


> @forge/forge-loop@0.1.0 test C:\Users\benja\Documents\forge-agent\packages\forge-loop
> node --test "src/__tests__/*.test.mjs"

✔ required package runbooks exist (3.83ms)
✔ package.json includes docs and readme in published files (1.2372ms)
✔ package docs and generated prompt templates are agent-agnostic (6.4262ms)
✔ doctor validates planning artifacts and reports next action (739.7ms)
✔ headless env gate runs only when headless flag is set (2.4072ms)
✔ headless env gate respects env enabled and enforce flags (0.4528ms)
✔ execute-phase summary upserts tasks and remains idempotent on rerun (2405.6246ms)
✔ commit message formatters follow contract (2.5586ms)
✔ commitPaths skips when repository is not git (105.6531ms)
✔ commitPaths skips when no tracked changes are present (923.7855ms)
✔ isInCommitScope matches allowed glob patterns (1.2311ms)
✔ commitPaths blocks out-of-scope files when commitScope is set (322.2421ms)
✔ commitPaths blocks staged files outside commit scope (500.6789ms)
✔ assertCommitResult throws on failed commit result (1.2914ms)
✔ parseStatusSections returns expected heading sections (3.1284ms)
✔ parseRalphDoneItems returns only done bullet lines (2.4715ms)
✔ parseNextItems parses bold and non-bold numbered lines (1.0679ms)
✔ parseTaskRegistryInitiatives parses markdown table rows (0.7665ms)
✔ buildMigrationWarnings reports missing key inputs (0.7484ms)
✔ loop:new creates loop scaffold and loop:use + --loop drive progress routing (1344.7486ms)
✔ updateGeneratedBlock injects generated section when markers are missing (2.3748ms)
✔ updateGeneratedBlock only replaces marker section and is idempotent (0.6877ms)
✔ new-project migrates legacy docs into .planning tree (413.8405ms)
✔ new-project on existing .planning reports guidance and does not overwrite (478.0457ms)
✔ new-project supports forge-loop profile (271.8899ms)
✔ new-project accepts generic as deprecated alias for forge-loop (217.5305ms)
✔ new-project supports custom profile with forge-loop verification baseline (225.3821ms)
✔ plan-phase creates plan files with required frontmatter fields (736.7614ms)
✔ sync-legacy respects legacySync.enabled flag (549.8889ms)
✔ validatePlanFrontmatter accepts required schema (6.9776ms)
✔ validatePlanFrontmatter fails missing required schema fields (0.8849ms)
✔ parsePlanFrontmatterYaml returns typed values (0.5294ms)
✔ validateWaveOrdering checks dependency graph and wave ordering (0.7297ms)
✔ parsePlanWave reads wave from frontmatter (1.0225ms)
✔ buildVerificationCommandPlan selects matrix commands by changed paths (3.247ms)
✔ buildVerificationCommandPlan supports forge-loop profile (2.127ms)
✔ verify-work emits expected check matrix in command output (4672.9128ms)
✔ verify-work --strict exits non-zero when checks fail (2539.035ms)
ℹ tests 38
ℹ suites 0
ℹ pass 38
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 7673.6582 |

## UAT Truths

| # | Truth | Status | Notes |
|---|---|---|---|
| 1 | Studio API key scope handling must support repo-studio desktop scope taxonomy without regressing existing AI scope behavior. | SKIPPED | Skipped in non-interactive mode. |
| 2 | Desktop connection validation endpoint must return deterministic capability payloads and actionable auth/scope errors. | SKIPPED | Skipped in non-interactive mode. |
| 3 | Outputs must keep Forge Loop artifacts traceable and deterministic for repeat runs. | SKIPPED | Skipped in non-interactive mode. |
| 4 | Desktop token lifecycle must persist credentials only in secure providers (keytar primary, safeStorage fallback, memory last-resort). | SKIPPED | Skipped in non-interactive mode. |
| 5 | Web/app runtime must not persist desktop tokens outside process memory. | SKIPPED | Skipped in non-interactive mode. |
| 6 | Outputs must keep Forge Loop artifacts traceable and deterministic for repeat runs. | SKIPPED | Skipped in non-interactive mode. |
| 7 | Connection status UX must be registry-driven and rendered in settings surfaces, not ad-hoc state-only controls. | SKIPPED | Skipped in non-interactive mode. |
| 8 | Capability/remediation messaging must be deterministic across desktop bridge and web API paths. | SKIPPED | Skipped in non-interactive mode. |
| 9 | Outputs must keep Forge Loop artifacts traceable and deterministic for repeat runs. | SKIPPED | Skipped in non-interactive mode. |
| 10 | Doctor output must expose deterministic desktop auth readiness/capability diagnostics. | SKIPPED | Skipped in non-interactive mode. |
| 11 | Runbooks must document secure setup and remediation without ever instructing insecure token storage. | SKIPPED | Skipped in non-interactive mode. |
| 12 | Outputs must keep Forge Loop artifacts traceable and deterministic for repeat runs. | SKIPPED | Skipped in non-interactive mode. |

## Gap Summary

- No blocking gaps found.
