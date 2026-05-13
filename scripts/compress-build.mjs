import { createBrotliCompress, createGzip } from 'node:zlib';
import { createReadStream, createWriteStream, existsSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';

const distDir = 'dist';
const compressible = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt']);

async function compressFile(file) {
  await Promise.all([
    pipeline(createReadStream(file), createGzip({ level: 9 }), createWriteStream(`${file}.gz`)),
    pipeline(createReadStream(file), createBrotliCompress(), createWriteStream(`${file}.br`)),
  ]);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);
    const stats = statSync(file);
    if (stats.isDirectory()) walk(file, out);
    else if (compressible.has(extname(file)) && stats.size > 512) out.push(file);
  }
  return out;
}

if (!existsSync(distDir)) {
  console.warn('dist not found; skipping compression');
  process.exit(0);
}

await Promise.all(walk(distDir).map(compressFile));
console.log('Generated gzip and brotli assets.');
