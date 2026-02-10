'use strict';

const fs = require('fs');
const path = require('path');

const pkgRoot = path.join(__dirname, '..');
const src = path.join(pkgRoot, 'node_modules', '@forge', 'shared', 'dist', 'styles', 'editor.css');
const outDir = path.join(pkgRoot, 'dist', 'styles');
const outFile = path.join(outDir, 'editor.css');

const content = fs.readFileSync(src, 'utf8');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, content, 'utf8');
