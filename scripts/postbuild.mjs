// Next.js standalone output leaves static assets outside the server bundle.
// They have to be copied in, or every page boots but loads without CSS.
// npm runs this automatically after `npm run build` (the postbuild hook), so
// local builds and Railway builds stay identical.
import { cpSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const standalone = path.join(root, '.next', 'standalone');

if (!existsSync(standalone)) {
  console.log('[postbuild] no standalone output found, nothing to copy');
  process.exit(0);
}

const pairs = [
  [path.join(root, 'public'), path.join(standalone, 'public')],
  [path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static')],
];

for (const [from, to] of pairs) {
  if (!existsSync(from)) continue;
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
  console.log(`[postbuild] ${path.relative(root, from)} -> ${path.relative(root, to)}`);
}
