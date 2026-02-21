/**
 * sync-content.mjs — Build-time content pipeline
 *
 * Copies markdown from delivery-process repo and dp-mini-demo tutorial,
 * injects Starlight frontmatter, strips H1, rewrites internal links,
 * and splits the tutorial into 10 parts.
 *
 * Usage:
 *   node scripts/sync-content.mjs
 *   node scripts/sync-content.mjs --verbose
 *
 * Sources (local dev):
 *   ../delivery-process/docs/          → manual docs
 *   ../delivery-process/docs-live/     → auto-generated (product areas, decisions)
 *   ../delivery-process/docs-generated/ → auto-generated (business rules, taxonomy)
 *   ../dp-mini-demo/TUTORIAL-ARTICLE-v1.md → tutorial
 *
 * Sources (CI — repos checked out as siblings):
 *   ./delivery-process/docs/           etc.
 *   ./dp-mini-demo/TUTORIAL-ARTICLE-v1.md
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync, cpSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose');

const DOCS_TARGET = join(ROOT, 'src/content/docs/delivery-process');

// ── Source resolution ──
// Try local dev paths first (sibling directories), fall back to CI layout (same directory)
function resolveSource(localPath, ciPath, nodeModulesPath = null) {
	const local = resolve(ROOT, localPath);
	const ci = resolve(ROOT, ciPath);
	if (existsSync(local)) return local;
	if (existsSync(ci)) return ci;
	if (nodeModulesPath) {
		const nm = resolve(ROOT, nodeModulesPath);
		if (existsSync(nm)) return nm;
	}
	return null;
}

const SOURCES = {
	docs: resolveSource(
		'../delivery-process/docs',
		'./delivery-process/docs',
		'node_modules/@libar-dev/delivery-process/docs',
	),
	docsLive: resolveSource('../delivery-process/docs-live', './delivery-process/docs-live'),
	docsGenerated: resolveSource('../delivery-process/docs-generated', './delivery-process/docs-generated'),
	readme: resolveSource('../delivery-process/README.md', './delivery-process/README.md'),
	tutorial: resolveSource('../dp-mini-demo/TUTORIAL-ARTICLE-v1.md', './dp-mini-demo/TUTORIAL-ARTICLE-v1.md'),
};

// ── File mapping: source filename → { target dir, target name, sidebar order, group } ──
const GUIDES_MAP = {
	'METHODOLOGY.md': { order: 1 },
	'CONFIGURATION.md': { order: 2 },
	'SESSION-GUIDES.md': { order: 3 },
	'GHERKIN-PATTERNS.md': { order: 4 },
	'ANNOTATION-GUIDE.md': { order: 5 },
	'PUBLISHING.md': { order: 6 },
};

const REFERENCE_MAP = {
	'ARCHITECTURE.md': { order: 1 },
	'PROCESS-API.md': { order: 2 },
	'PROCESS-GUARD.md': { order: 3 },
	'VALIDATION.md': { order: 4 },
	'TAXONOMY.md': { order: 5 },
};

// ── Internal link rewriting ──
const LINK_REWRITES = {
	// docs/ files referencing each other
	'./METHODOLOGY.md': '/delivery-process/guides/methodology/',
	'./CONFIGURATION.md': '/delivery-process/guides/configuration/',
	'./SESSION-GUIDES.md': '/delivery-process/guides/session-guides/',
	'./GHERKIN-PATTERNS.md': '/delivery-process/guides/gherkin-patterns/',
	'./ANNOTATION-GUIDE.md': '/delivery-process/guides/annotation-guide/',
	'./PUBLISHING.md': '/delivery-process/guides/publishing/',
	'./ARCHITECTURE.md': '/delivery-process/reference/architecture/',
	'./PROCESS-API.md': '/delivery-process/reference/process-api/',
	'./PROCESS-GUARD.md': '/delivery-process/reference/process-guard/',
	'./VALIDATION.md': '/delivery-process/reference/validation/',
	'./TAXONOMY.md': '/delivery-process/reference/taxonomy/',
	'./INDEX.md': '/delivery-process/',
	// Relative up references from docs/ to repo root
	'../README.md': '/delivery-process/getting-started/',
	'../CHANGELOG.md': 'https://github.com/libar-dev/delivery-process/blob/main/CHANGELOG.md',
	'../SECURITY.md': 'https://github.com/libar-dev/delivery-process/blob/main/SECURITY.md',
	'../CLAUDE.md': 'https://github.com/libar-dev/delivery-process/blob/main/CLAUDE.md',
	'../src/taxonomy/': 'https://github.com/libar-dev/delivery-process/tree/main/src/taxonomy/',
	'../tests/features/validation/fsm-validator.feature': 'https://github.com/libar-dev/delivery-process/blob/main/tests/features/validation/fsm-validator.feature',
	'../tests/features/behavior/session-handoffs.feature': 'https://github.com/libar-dev/delivery-process/blob/main/tests/features/behavior/session-handoffs.feature',
};

// ── Helpers ──

function log(msg) {
	if (VERBOSE) console.log(`  [sync] ${msg}`);
}

function extractTitle(content) {
	const match = content.match(/^#\s+(.+)$/m);
	return match ? match[1].trim() : 'Untitled';
}

function stripFirstH1(content) {
	return content.replace(/^#\s+.+\n+/, '');
}

function rewriteLinks(content) {
	let result = content;
	for (const [from, to] of Object.entries(LINK_REWRITES)) {
		// Match markdown links: [text](./FILE.md) or [text](../FILE.md)
		const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`\\]\\(${escaped}\\)`, 'g');
		result = result.replace(regex, `](${to})`);
	}
	return result;
}

function buildFrontmatter({ title, description, sidebarOrder, sidebarLabel, editUrl = true, generated = false }) {
	const lines = ['---'];
	lines.push(`title: "${title.replace(/"/g, '\\"')}"`);
	if (description) lines.push(`description: "${description.replace(/"/g, '\\"')}"`);
	if (sidebarOrder !== undefined || sidebarLabel) {
		lines.push('sidebar:');
		if (sidebarLabel) lines.push(`  label: "${sidebarLabel}"`);
		if (sidebarOrder !== undefined) lines.push(`  order: ${sidebarOrder}`);
	}
	if (!editUrl) lines.push('editUrl: false');
	lines.push('---');
	lines.push('');
	return lines.join('\n');
}

function processMarkdownFile(content, { sidebarOrder, sidebarLabel, editUrl = true, generated = false } = {}) {
	const title = extractTitle(content);
	const stripped = stripFirstH1(content);
	const rewritten = rewriteLinks(stripped);
	const frontmatter = buildFrontmatter({ title, sidebarOrder, sidebarLabel, editUrl, generated });
	return frontmatter + rewritten;
}

function ensureDir(dir) {
	mkdirSync(dir, { recursive: true });
}

function cleanDir(dir) {
	if (existsSync(dir)) {
		// Remove all files and subdirectories but preserve the directory itself
		for (const entry of readdirSync(dir)) {
			const path = join(dir, entry);
			rmSync(path, { recursive: true, force: true });
		}
	}
}

function copyAndProcess(srcPath, destPath, opts = {}) {
	const content = readFileSync(srcPath, 'utf-8');
	const processed = processMarkdownFile(content, opts);
	ensureDir(dirname(destPath));
	writeFileSync(destPath, processed);
	log(`${basename(srcPath)} → ${destPath.replace(ROOT, '.')}`);
}

// ── Sync functions ──

function syncManualDocs() {
	if (!SOURCES.docs) {
		console.warn('  [sync] WARNING: delivery-process/docs/ not found, skipping manual docs');
		return;
	}

	console.log('  [sync] Syncing manual docs...');

	// Guides
	const guidesDir = join(DOCS_TARGET, 'guides');
	ensureDir(guidesDir);
	for (const [filename, opts] of Object.entries(GUIDES_MAP)) {
		const src = join(SOURCES.docs, filename);
		if (existsSync(src)) {
			const dest = join(guidesDir, filename.toLowerCase());
			copyAndProcess(src, dest, { sidebarOrder: opts.order });
		} else {
			console.warn(`  [sync] WARNING: ${filename} not found`);
		}
	}

	// Reference
	const refDir = join(DOCS_TARGET, 'reference');
	ensureDir(refDir);
	for (const [filename, opts] of Object.entries(REFERENCE_MAP)) {
		const src = join(SOURCES.docs, filename);
		if (existsSync(src)) {
			const dest = join(refDir, filename.toLowerCase());
			copyAndProcess(src, dest, { sidebarOrder: opts.order });
		} else {
			console.warn(`  [sync] WARNING: ${filename} not found`);
		}
	}
}

function syncProductAreas() {
	if (!SOURCES.docsLive) {
		console.warn('  [sync] WARNING: delivery-process/docs-live/ not found, skipping product areas');
		return;
	}

	console.log('  [sync] Syncing product areas...');
	const targetDir = join(DOCS_TARGET, 'product-areas');
	ensureDir(targetDir);

	// Index file
	const indexSrc = join(SOURCES.docsLive, 'PRODUCT-AREAS.md');
	if (existsSync(indexSrc)) {
		copyAndProcess(indexSrc, join(targetDir, 'index.md'), { sidebarOrder: 0, sidebarLabel: 'Overview', editUrl: false, generated: true });
	}

	// Individual product area files
	const paDir = join(SOURCES.docsLive, 'product-areas');
	if (existsSync(paDir)) {
		let order = 1;
		for (const file of readdirSync(paDir).filter(f => f.endsWith('.md')).sort()) {
			copyAndProcess(join(paDir, file), join(targetDir, file.toLowerCase()), { sidebarOrder: order++, editUrl: false, generated: true });
		}
	}
}

function syncDecisions() {
	if (!SOURCES.docsLive) {
		console.warn('  [sync] WARNING: delivery-process/docs-live/ not found, skipping decisions');
		return;
	}

	console.log('  [sync] Syncing architecture decisions...');
	const targetDir = join(DOCS_TARGET, 'decisions');
	ensureDir(targetDir);

	// Index file
	const indexSrc = join(SOURCES.docsLive, 'DECISIONS.md');
	if (existsSync(indexSrc)) {
		copyAndProcess(indexSrc, join(targetDir, 'index.md'), { sidebarOrder: 0, sidebarLabel: 'Overview', editUrl: false, generated: true });
	}

	// Individual ADR files
	const adrDir = join(SOURCES.docsLive, 'decisions');
	if (existsSync(adrDir)) {
		let order = 1;
		for (const file of readdirSync(adrDir).filter(f => f.endsWith('.md')).sort()) {
			copyAndProcess(join(adrDir, file), join(targetDir, file), { sidebarOrder: order++, editUrl: false, generated: true });
		}
	}
}

function syncGenerated() {
	if (!SOURCES.docsGenerated) {
		console.warn('  [sync] WARNING: delivery-process/docs-generated/ not found, skipping generated docs');
		return;
	}

	console.log('  [sync] Syncing generated reference docs...');
	const targetDir = join(DOCS_TARGET, 'generated');
	ensureDir(targetDir);

	// Business rules index + per-area files
	const brSrc = join(SOURCES.docsGenerated, 'BUSINESS-RULES.md');
	if (existsSync(brSrc)) {
		const brDir = join(targetDir, 'business-rules');
		ensureDir(brDir);
		copyAndProcess(brSrc, join(brDir, 'index.md'), { sidebarOrder: 0, sidebarLabel: 'Business Rules', editUrl: false, generated: true });

		const brSubDir = join(SOURCES.docsGenerated, 'business-rules');
		if (existsSync(brSubDir)) {
			let order = 1;
			for (const file of readdirSync(brSubDir).filter(f => f.endsWith('.md')).sort()) {
				copyAndProcess(join(brSubDir, file), join(brDir, file), { sidebarOrder: order++, editUrl: false, generated: true });
			}
		}
	}

	// Taxonomy index + sub-files
	const taxSrc = join(SOURCES.docsGenerated, 'TAXONOMY.md');
	if (existsSync(taxSrc)) {
		const taxDir = join(targetDir, 'taxonomy');
		ensureDir(taxDir);
		copyAndProcess(taxSrc, join(taxDir, 'index.md'), { sidebarOrder: 10, sidebarLabel: 'Taxonomy', editUrl: false, generated: true });

		const taxSubDir = join(SOURCES.docsGenerated, 'taxonomy');
		if (existsSync(taxSubDir)) {
			let order = 11;
			for (const file of readdirSync(taxSubDir).filter(f => f.endsWith('.md')).sort()) {
				copyAndProcess(join(taxSubDir, file), join(taxDir, file), { sidebarOrder: order++, editUrl: false, generated: true });
			}
		}
	}

	// Reference sample
	const refSrc = join(SOURCES.docsGenerated, 'docs', 'REFERENCE-SAMPLE.md');
	if (existsSync(refSrc)) {
		copyAndProcess(refSrc, join(targetDir, 'reference-sample.md'), { sidebarOrder: 20, editUrl: false, generated: true });
	}
}

function syncTutorial() {
	if (!SOURCES.tutorial) {
		console.warn('  [sync] WARNING: dp-mini-demo/TUTORIAL-ARTICLE-v1.md not found, skipping tutorial');
		return;
	}

	console.log('  [sync] Syncing and splitting tutorial...');
	const targetDir = join(DOCS_TARGET, 'tutorial');
	ensureDir(targetDir);

	const content = readFileSync(SOURCES.tutorial, 'utf-8');

	// Split on "## Part N:" headings
	const partRegex = /^## Part (\d+):\s*(.+)$/gm;
	const parts = [];
	let match;

	while ((match = partRegex.exec(content)) !== null) {
		parts.push({
			number: parseInt(match[1], 10),
			title: match[2].trim(),
			startIndex: match.index,
		});
	}

	if (parts.length === 0) {
		console.warn('  [sync] WARNING: No "## Part N:" headings found in tutorial, copying as single file');
		copyAndProcess(SOURCES.tutorial, join(targetDir, 'index.md'), { sidebarOrder: 0 });
		return;
	}

	// Extract introduction (content before first part)
	const introContent = content.substring(0, parts[0].startIndex).trim();
	if (introContent) {
		const introTitle = extractTitle(introContent);
		const introStripped = stripFirstH1(introContent);
		const introFrontmatter = buildFrontmatter({
			title: introTitle,
			sidebarOrder: 0,
			sidebarLabel: 'Introduction',
		});
		writeFileSync(join(targetDir, 'index.md'), introFrontmatter + introStripped);
		log('Tutorial intro → tutorial/index.md');
	}

	// Extract each part
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		const endIndex = i + 1 < parts.length ? parts[i + 1].startIndex : content.length;
		let partContent = content.substring(part.startIndex, endIndex).trim();

		// The part content starts with "## Part N: Title" — promote to H1 for processing
		partContent = partContent.replace(/^## /, '# ');

		const padded = String(part.number).padStart(2, '0');
		const filename = `${padded}-${part.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}.md`;

		const processed = processMarkdownFile(partContent, {
			sidebarOrder: part.number,
			sidebarLabel: `Part ${part.number}: ${part.title}`,
		});

		writeFileSync(join(targetDir, filename), processed);
		log(`Tutorial Part ${part.number} → tutorial/${filename}`);
	}

	console.log(`  [sync] Tutorial split into ${parts.length} parts`);
}

// ── Main ──

console.log('[sync-content] Starting content sync...');
console.log(`[sync-content] Target: ${DOCS_TARGET}`);

// Show source resolution
for (const [key, path] of Object.entries(SOURCES)) {
	if (path) {
		log(`Source ${key}: ${path}`);
	} else {
		console.warn(`  [sync] Source ${key}: NOT FOUND`);
	}
}

// Clean synced directories (but not hand-crafted files at the root)
for (const subdir of ['guides', 'reference', 'product-areas', 'decisions', 'generated', 'tutorial']) {
	cleanDir(join(DOCS_TARGET, subdir));
}

syncManualDocs();
syncProductAreas();
syncDecisions();
syncGenerated();
syncTutorial();

console.log('[sync-content] Done!');
