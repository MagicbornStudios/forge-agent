---
phase: 06-workspace-contributions-and-ide-navigation-core
verified: 2026-02-16T19:56:58.523Z
status: human_needed
score: 0/8
---

# Phase 06: Workspace contributions and IDE navigation core Verification Report

**Phase Goal:** Add workspace-contributed menus/settings and IDE-like Navigator/search baseline with publishability parity.
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
| pnpm --filter @forge/studio build | PASS | ⚠ Compiled with warnings in 37.5s

../../node_modules/.pnpm/typescript@5.8.3/node_modules/typescript/lib/typescript.js
Critical dependency: the request of a dependency is an expression

Import trace for requested module:
../../node_modules/.pnpm/typescript@5.8.3/node_modules/typescript/lib/typescript.js
../../node_modules/.pnpm/@payloadcms+drizzle@3.74.0_@libsql+client@0.14.0_@opentelemetry+api@1.9.0_@types+pg@8.10.2_pa_msw3xvwd3gkad3fahmgh3o6s24/node_modules/@payloadcms/drizzle/dist/utilities/blocksToJsonMigrator.js
../../node_modules/.pnpm/@payloadcms+drizzle@3.74.0_@libsql+client@0.14.0_@opentelemetry+api@1.9.0_@types+pg@8.10.2_pa_msw3xvwd3gkad3fahmgh3o6s24/node_modules/@payloadcms/drizzle/dist/index.js
../../node_modules/.pnpm/@payloadcms+db-postgres@3.74.0_@libsql+client@0.14.0_@opentelemetry+api@1.9.0_payload@3.74.0__2bwhaqxnwmcpjvhaz3tkkximse/node_modules/@payloadcms/db-postgres/dist/index.js
./payload.config.ts
./app/(payload)/api/graphql-playground/route.ts

Failed to load undo-redo state from localStorage: ReferenceError: localStorage is not defined
    at aq (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96155)
    at <unknown> (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96407)
    at ar (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96389)
Failed to load undo-redo state from localStorage: ReferenceError: localStorage is not defined
    at aq (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96155)
    at <unknown> (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96407)
    at ar (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96389)
Failed to load undo-redo state from localStorage: ReferenceError: localStorage is not defined
    at aq (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96155)
    at <unknown> (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96407)
    at ar (C:\Users\benja\Documents\forge-agent\apps\studio\.next\server\chunks\1170.js:3:96389) |
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
PASS __tests__/model-router/selection.test.ts

Test Suites: 6 passed, 6 total
Tests:       19 passed, 19 total
Snapshots:   0 total
Time:        2.747 s, estimated 3 s
Ran all test suites. |
| pnpm forge-loop:test | PASS | > forge-agent@ forge-loop:test C:\Users\benja\Documents\forge-agent
> pnpm --filter @forge/forge-loop test


> @forge/forge-loop@0.1.0 test C:\Users\benja\Documents\forge-agent\packages\forge-loop
> node --test "src/__tests__/*.test.mjs"

✔ required package runbooks exist (4.2674ms)
✔ package.json includes docs and readme in published files (1.1818ms)
✔ package docs and generated prompt templates are agent-agnostic (5.4132ms)
✔ doctor validates planning artifacts and reports next action (534.5963ms)
✔ headless env gate runs only when headless flag is set (2.168ms)
✔ headless env gate respects env enabled and enforce flags (0.4272ms)
✔ execute-phase summary upserts tasks and remains idempotent on rerun (1857.3925ms)
✔ commit message formatters follow contract (1.7477ms)
✔ commitPaths skips when repository is not git (80.4539ms)
✔ commitPaths skips when no tracked changes are present (695.4524ms)
✔ isInCommitScope matches allowed glob patterns (0.6747ms)
✔ commitPaths blocks out-of-scope files when commitScope is set (264.2274ms)
✔ commitPaths blocks staged files outside commit scope (393.4869ms)
✔ assertCommitResult throws on failed commit result (0.699ms)
✔ parseStatusSections returns expected heading sections (2.4043ms)
✔ parseRalphDoneItems returns only done bullet lines (2.0439ms)
✔ parseNextItems parses bold and non-bold numbered lines (0.7721ms)
✔ parseTaskRegistryInitiatives parses markdown table rows (0.7126ms)
✔ buildMigrationWarnings reports missing key inputs (0.6513ms)
✔ loop:new creates loop scaffold and loop:use + --loop drive progress routing (957.0507ms)
✔ updateGeneratedBlock injects generated section when markers are missing (2.2269ms)
✔ updateGeneratedBlock only replaces marker section and is idempotent (2.6686ms)
✔ new-project migrates legacy docs into .planning tree (297.5834ms)
✔ new-project on existing .planning reports guidance and does not overwrite (363.6572ms)
✔ new-project supports forge-loop profile (193.415ms)
✔ new-project accepts generic as deprecated alias for forge-loop (182.0683ms)
✔ new-project supports custom profile with forge-loop verification baseline (172.1238ms)
✔ plan-phase creates plan files with required frontmatter fields (528.7737ms)
✔ sync-legacy respects legacySync.enabled flag (420.2556ms)
✔ validatePlanFrontmatter accepts required schema (6.2279ms)
✔ validatePlanFrontmatter fails missing required schema fields (0.7921ms)
✔ parsePlanFrontmatterYaml returns typed values (0.5335ms)
✔ validateWaveOrdering checks dependency graph and wave ordering (0.6117ms)
✔ parsePlanWave reads wave from frontmatter (0.5019ms)
✔ buildVerificationCommandPlan selects matrix commands by changed paths (2.1802ms)
✔ buildVerificationCommandPlan supports forge-loop profile (1.8362ms)
✔ verify-work emits expected check matrix in command output (3829.9942ms)
✔ verify-work --strict exits non-zero when checks fail (2206.3354ms)
ℹ tests 38
ℹ suites 0
ℹ pass 38
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6436.0478 |

## UAT Truths

| # | Truth | Status | Notes |
|---|---|---|---|
| 1 | RepoStudio app runtime components and hooks must stop using hand-rolled fetch and route all calls through typed API service modules. | SKIPPED | Skipped in non-interactive mode. |
| 2 | Workspace-contributed menubar contracts must align with DS-07 and DS-08 in repo_studio_analysis decision artifacts. | SKIPPED | Skipped in non-interactive mode. |
| 3 | Navigator must be generic and reusable across workspaces, with Code workspace as first rollout consumer (IN-01). | SKIPPED | Skipped in non-interactive mode. |
| 4 | Feature workspaces must consume typed service layer instead of direct fetch. | SKIPPED | Skipped in non-interactive mode. |
| 5 | Search implementation must be server-side and support plain + regex query modes (IN-02). | SKIPPED | Skipped in non-interactive mode. |
| 6 | Default excludes must remain disabled; include/exclude filters are user-provided only (IN-04). | SKIPPED | Skipped in non-interactive mode. |
| 7 | Navigator/open-file surfaces must include git status decorations for changed/new files. | SKIPPED | Skipped in non-interactive mode. |
| 8 | Direct fetch detection guard is warning-only in this phase and must not fail CI by default. | SKIPPED | Skipped in non-interactive mode. |

## Gap Summary

- No blocking gaps found.
