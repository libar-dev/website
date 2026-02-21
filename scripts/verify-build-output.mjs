import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

const required = [
	'index.html',
	'docs/index.html',
	'delivery-process/index.html',
	'delivery-process/guides/methodology/index.html',
	'delivery-process/tutorial/10-advanced-process-data-api/index.html',
	'sitemap-index.xml',
];

const missing = required.filter(file => !existsSync(resolve(DIST, file)));
if (missing.length > 0) {
	console.error('[verify-build] ERROR: Missing expected build artifacts:');
	for (const file of missing) {
		console.error(`  - ${file}`);
	}
	process.exit(1);
}

console.log('[verify-build] OK: required build artifacts are present.');
