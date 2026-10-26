import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dist = path.join(root, 'dist');
const pages = ['index.html', 'shop.html', 'product.html', 'about.html', 'contact.html', 'cart.html'];
const publicFiles = [...pages, 'robots.txt', 'site.webmanifest', '.htaccess'];
const sourceFiles = [
  ...pages,
  'site.webmanifest',
  'assets/css/styles.css',
  'assets/js/app.js',
  'assets/js/config.js',
  'assets/js/products.js',
  'assets/js/site-shell.js',
  'assets/js/store.js',
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of publicFiles) await cp(path.join(root, file), path.join(dist, file));
await cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });

// Keep the full campaign library in source control, but ship only images used by the storefront.
const productionImages = new Set();
for (const file of sourceFiles) {
  const source = await readFile(path.join(root, file), 'utf8');
  for (const match of source.matchAll(/generated\/[a-zA-Z0-9._/-]+/g)) productionImages.add(match[0]);
}
for (const image of productionImages) {
  const output = path.join(dist, image);
  await mkdir(path.dirname(output), { recursive: true });
  await cp(path.join(root, image), output);
}

const missing = [];
for (const page of pages) {
  const html = await readFile(path.join(root, page), 'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"#?]+)"/g)]
    .map((match) => match[1])
    .filter((ref) => !/^(?:https?:|mailto:|tel:)/.test(ref) && !ref.endsWith('.html'));
  for (const ref of refs) {
    try { await stat(path.join(root, ref)); } catch { missing.push(`${page}: ${ref}`); }
  }
}

if (missing.length) {
  console.error('Missing local references:\n' + missing.join('\n'));
  process.exit(1);
}

const files = await readdir(dist, { recursive: true });
console.log(`Production build complete: ${files.length} entries, ${productionImages.size} campaign images in dist/`);
