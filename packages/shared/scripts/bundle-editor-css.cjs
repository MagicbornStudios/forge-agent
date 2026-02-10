'use strict';

const fs = require('fs');
const path = require('path');

const pkgRoot = path.join(__dirname, '..');
const dockviewCss = path.join(pkgRoot, 'node_modules', 'dockview', 'dist', 'styles', 'dockview.css');
const overridesCss = path.join(pkgRoot, 'src', 'shared', 'styles', 'dockview-overrides.css');
const outDir = path.join(pkgRoot, 'dist', 'styles');
const outFile = path.join(outDir, 'editor.css');

const base = fs.readFileSync(dockviewCss, 'utf8');
const overrides = fs.readFileSync(overridesCss, 'utf8');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, base + '\n' + overrides, 'utf8');
