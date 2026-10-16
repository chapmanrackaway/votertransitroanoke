#!/usr/bin/env node
// Copies Leaflet from node_modules into docs/vendor so the site has no CDN dependency.
// The copy is committed, so the site runs without a build step.
import { cp, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'leaflet', 'dist');
const dest = join(root, 'docs', 'vendor', 'leaflet');
await mkdir(dest, { recursive: true });
for (const f of ['leaflet.js', 'leaflet.css', 'images']) await cp(join(src, f), join(dest, f), { recursive: true });
console.log('• Copied Leaflet to docs/vendor/leaflet');
