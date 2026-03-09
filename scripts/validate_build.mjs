import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const canonicalBase = (process.env.PUBLIC_SITE_URL || 'https://ai-yu-me.com').replace(/\/+$/, '');
const forbiddenTokens = [
  'TODO_',
  'NEW_DOMAIN',
  'AIYuMe',
  'https://aiyume-web.pages.dev/api/voidrush',
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function collectFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
      continue;
    }
    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function readUtf8(filePath) {
  return readFileSync(filePath, 'utf8');
}

function ensureNoForbiddenTokens(files) {
  for (const filePath of files) {
    const ext = path.extname(filePath);
    if (!['.html', '.txt', '.xml', '.js', '.css', '.svg'].includes(ext)) continue;
    const body = readUtf8(filePath);
    for (const token of forbiddenTokens) {
      assert(!body.includes(token), `${path.relative(distDir, filePath)} contains forbidden token: ${token}`);
    }
  }
}

function ensureRobotsAndSitemap() {
  const robotsPath = path.join(distDir, 'robots.txt');
  const sitemapPath = path.join(distDir, 'sitemap.xml');
  const robots = readUtf8(robotsPath);
  const sitemap = readUtf8(sitemapPath);

  assert(
    robots.includes(`Sitemap: ${canonicalBase}/sitemap.xml`),
    'robots.txt does not point to the canonical sitemap URL',
  );
  assert(
    sitemap.includes(`${canonicalBase}/learning`) &&
      sitemap.includes(`${canonicalBase}/studio`) &&
      sitemap.includes(`${canonicalBase}/automation`) &&
      sitemap.includes(`${canonicalBase}/creator/void-rush`),
    'sitemap.xml is missing one or more canonical routes',
  );
}

function ensureVoidRushAssetRefs() {
  const htmlPath = path.join(distDir, 'creator', 'void-rush', 'index.html');
  const html = readUtf8(htmlPath);
  const scriptMatch = html.match(/<script[^>]+src="([^"]+)"/i);
  const styleMatch = html.match(/<link[^>]+href="([^"]+index-[^"]+\.css)"/i);

  assert(scriptMatch, 'VOID-RUSH index.html is missing a module script reference');
  assert(styleMatch, 'VOID-RUSH index.html is missing a stylesheet reference');

  const scriptPath = path.join(distDir, scriptMatch[1].replace(/^\//, ''));
  const stylePath = path.join(distDir, styleMatch[1].replace(/^\//, ''));
  assert(existsSync(scriptPath), `VOID-RUSH script asset does not exist: ${scriptPath}`);
  assert(existsSync(stylePath), `VOID-RUSH stylesheet asset does not exist: ${stylePath}`);

  const bundle = readUtf8(scriptPath);
  assert(bundle.includes('/api/voidrush'), 'VOID-RUSH bundle does not default to same-origin /api/voidrush');
}

function main() {
  assert(existsSync(distDir), 'dist directory does not exist. Run `npm run build` first.');
  assert(statSync(distDir).isDirectory(), 'dist exists but is not a directory');

  const files = collectFiles(distDir);
  ensureNoForbiddenTokens(files);
  ensureRobotsAndSitemap();
  ensureVoidRushAssetRefs();

  console.log('Build validation passed.');
}

main();
