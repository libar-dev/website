/**
 * sync-content.mjs — Build-time content pipeline
 *
 * Copies markdown from delivery-process npm package and delivery-process-tutorials repo,
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
 *   ../delivery-process-tutorials/TUTORIAL-ARTICLE-v1.md → tutorial
 *
 * Sources (CI — tutorial repo checked out as sibling; delivery-process via node_modules):
 *   ./delivery-process-tutorials/TUTORIAL-ARTICLE-v1.md
 *   node_modules/@libar-dev/delivery-process/{docs,docs-live,docs-generated}
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { join, basename, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import {
	DELIVERY_PROCESS_DOCS,
	DELIVERY_PROCESS_LINK_REWRITES,
	DELIVERY_PROCESS_LINK_PREFIX_REWRITES,
	DELIVERY_PROCESS_MANUAL_DOCS,
	DELIVERY_PROCESS_SYNC_SUBDIRS,
} from './content-manifest.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const VERBOSE = process.argv.includes('--verbose');
const STRICT_MODE = process.argv.includes('--strict') || process.env.CI === 'true';

const DOCS_TARGET = join(ROOT, 'src/content/docs', DELIVERY_PROCESS_DOCS.slug);

// ── Source resolution ──
// Try local dev paths first (sibling directories), fall back to CI layout (same directory)
function resolveSource(localPath, ciPath, nodeModulesPath = null, envVar = null) {
	if (envVar && process.env[envVar]) {
		const overridden = resolve(ROOT, process.env[envVar]);
		if (existsSync(overridden)) return overridden;
		return null;
	}

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
		'SYNC_SOURCE_DOCS',
	),
	docsLive: resolveSource(
		'../delivery-process/docs-live',
		'./delivery-process/docs-live',
		'node_modules/@libar-dev/delivery-process/docs-live',
		'SYNC_SOURCE_DOCS_LIVE',
	),
	docsGenerated: resolveSource(
		'../delivery-process/docs-generated',
		'./delivery-process/docs-generated',
		'node_modules/@libar-dev/delivery-process/docs-generated',
		'SYNC_SOURCE_DOCS_GENERATED',
	),
	readme: resolveSource('../delivery-process/README.md', './delivery-process/README.md', null, 'SYNC_SOURCE_README'),
	tutorial: resolveSource(
		'../delivery-process-tutorials/TUTORIAL-ARTICLE-v1.md',
		'./delivery-process-tutorials/TUTORIAL-ARTICLE-v1.md',
		null,
		'SYNC_SOURCE_TUTORIAL',
	),
};

const REQUIRED_SOURCES = [
	{ key: 'docs', label: 'delivery-process/docs' },
	{ key: 'docsLive', label: 'delivery-process/docs-live' },
	{ key: 'docsGenerated', label: 'delivery-process/docs-generated' },
	{ key: 'tutorial', label: 'delivery-process-tutorials/TUTORIAL-ARTICLE-v1.md' },
];
const REQUIRED_SOURCE_FILES = [
	...DELIVERY_PROCESS_MANUAL_DOCS.guides.map(file => ({
		key: 'docs',
		relativePath: file.source,
		label: `delivery-process/docs/${file.source}`,
	})),
	...DELIVERY_PROCESS_MANUAL_DOCS.reference.map(file => ({
		key: 'docs',
		relativePath: file.source,
		label: `delivery-process/docs/${file.source}`,
	})),
	{ key: 'docsLive', relativePath: 'PRODUCT-AREAS.md', label: 'delivery-process/docs-live/PRODUCT-AREAS.md' },
	{ key: 'docsLive', relativePath: 'DECISIONS.md', label: 'delivery-process/docs-live/DECISIONS.md' },
	{ key: 'docsGenerated', relativePath: 'BUSINESS-RULES.md', label: 'delivery-process/docs-generated/BUSINESS-RULES.md' },
	{ key: 'docsGenerated', relativePath: 'TAXONOMY.md', label: 'delivery-process/docs-generated/TAXONOMY.md' },
];
const EXPECTED_TUTORIAL_PARTS = Number.parseInt(process.env.TUTORIAL_EXPECTED_PARTS || '10', 10);
const MARKDOWN_PROCESSOR = unified().use(remarkParse).use(remarkStringify, {
	fences: true,
	listItemIndent: 'one',
});

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

function splitLinkTarget(url) {
	const match = /^([^?#]*)([?#].*)?$/.exec(url);
	if (!match) {
		return {
			path: url,
			suffix: '',
		};
	}
	return {
		path: match[1],
		suffix: match[2] || '',
	};
}

function isAbsoluteOrSpecialLink(path) {
	if (!path) return true;
	if (path.startsWith('/')) return true;
	if (path.startsWith('#')) return true;
	return /^[a-z][a-z0-9+.-]*:/i.test(path);
}

function getSourceRelativePath(rootPath, absolutePath) {
	if (!rootPath || !absolutePath) return null;
	const rel = relative(rootPath, absolutePath).replace(/\\/g, '/');
	if (!rel || rel === '.' || rel.startsWith('../')) return null;
	return rel;
}

function toDocsRoute(section, slug) {
	if (!slug) return `/${DELIVERY_PROCESS_DOCS.slug}/${section}/`;
	return `/${DELIVERY_PROCESS_DOCS.slug}/${section}/${slug}/`;
}

const GUIDE_SOURCE_TO_SLUG = new Map(DELIVERY_PROCESS_MANUAL_DOCS.guides.map(file => [file.source, file.slug]));
const REFERENCE_SOURCE_TO_SLUG = new Map(DELIVERY_PROCESS_MANUAL_DOCS.reference.map(file => [file.source, file.slug]));

function getSyncedRouteForSourceFile(sourceFilePath) {
	const docsRel = getSourceRelativePath(SOURCES.docs, sourceFilePath);
	if (docsRel) {
		if (docsRel === 'INDEX.md') return `/${DELIVERY_PROCESS_DOCS.slug}/`;
		if (docsRel === 'README.md') return `/${DELIVERY_PROCESS_DOCS.slug}/getting-started/`;
		if (GUIDE_SOURCE_TO_SLUG.has(docsRel)) return toDocsRoute('guides', GUIDE_SOURCE_TO_SLUG.get(docsRel));
		if (REFERENCE_SOURCE_TO_SLUG.has(docsRel)) return toDocsRoute('reference', REFERENCE_SOURCE_TO_SLUG.get(docsRel));
	}

	const docsLiveRel = getSourceRelativePath(SOURCES.docsLive, sourceFilePath);
	if (docsLiveRel) {
		if (docsLiveRel === 'PRODUCT-AREAS.md') return toDocsRoute('product-areas', '');
		if (docsLiveRel === 'DECISIONS.md') return toDocsRoute('decisions', '');
		if (/^product-areas\/.+\.md$/i.test(docsLiveRel)) {
			const slug = basename(docsLiveRel, '.md').toLowerCase();
			return toDocsRoute('product-areas', slug);
		}
		if (/^decisions\/.+\.md$/i.test(docsLiveRel)) {
			const slug = basename(docsLiveRel, '.md').toLowerCase();
			return toDocsRoute('decisions', slug);
		}
	}

	const docsGeneratedRel = getSourceRelativePath(SOURCES.docsGenerated, sourceFilePath);
	if (docsGeneratedRel) {
		if (docsGeneratedRel === 'BUSINESS-RULES.md') return `/${DELIVERY_PROCESS_DOCS.slug}/generated/business-rules/`;
		if (docsGeneratedRel === 'TAXONOMY.md') return `/${DELIVERY_PROCESS_DOCS.slug}/generated/taxonomy/`;
		if (docsGeneratedRel === 'docs/REFERENCE-SAMPLE.md')
			return `/${DELIVERY_PROCESS_DOCS.slug}/generated/reference-sample/`;
		if (/^business-rules\/.+\.md$/i.test(docsGeneratedRel)) {
			const slug = basename(docsGeneratedRel, '.md').toLowerCase();
			return `/${DELIVERY_PROCESS_DOCS.slug}/generated/business-rules/${slug}/`;
		}
		if (/^taxonomy\/.+\.md$/i.test(docsGeneratedRel)) {
			const slug = basename(docsGeneratedRel, '.md').toLowerCase();
			return `/${DELIVERY_PROCESS_DOCS.slug}/generated/taxonomy/${slug}/`;
		}
	}

	return null;
}

function resolveSyncedDocLink(url, sourceFilePath) {
	if (!sourceFilePath) return null;
	const { path: linkPath, suffix } = splitLinkTarget(url);
	if (isAbsoluteOrSpecialLink(linkPath)) return null;
	const targetSourcePath = resolve(dirname(sourceFilePath), linkPath);
	const resolvedRoute = getSyncedRouteForSourceFile(targetSourcePath);
	if (!resolvedRoute) return null;
	return `${resolvedRoute}${suffix}`;
}

function applyLinkPrefixRewrite(url) {
	const { path: linkPath, suffix } = splitLinkTarget(url);
	if (isAbsoluteOrSpecialLink(linkPath)) return null;

	const normalizedPath = linkPath.replace(/^\.\//, '');
	for (const rewrite of DELIVERY_PROCESS_LINK_PREFIX_REWRITES) {
		if (!normalizedPath.startsWith(rewrite.prefix)) continue;
		const remainder = rewrite.stripPrefix ? normalizedPath.slice(rewrite.prefix.length) : normalizedPath;
		return `${rewrite.targetPrefix}${remainder}${suffix}`;
	}

	return null;
}

function applyLinkRewrite(url, sourceFilePath) {
	for (const [from, to] of Object.entries(DELIVERY_PROCESS_LINK_REWRITES)) {
		if (url === from) return to;
		if (url.startsWith(`${from}#`)) return `${to}${url.slice(from.length)}`;
		if (url.startsWith(`${from}?`)) return `${to}${url.slice(from.length)}`;
	}

	const syncedDocRewrite = resolveSyncedDocLink(url, sourceFilePath);
	if (syncedDocRewrite) return syncedDocRewrite;

	const prefixRewrite = applyLinkPrefixRewrite(url);
	if (prefixRewrite) return prefixRewrite;

	return null;
}

function rewriteLinks(content, sourceFilePath) {
	const tree = MARKDOWN_PROCESSOR.parse(content);
	visit(tree, ['link', 'image'], node => {
		const rewritten = applyLinkRewrite(node.url, sourceFilePath);
		if (rewritten) node.url = rewritten;
	});
	return String(MARKDOWN_PROCESSOR.stringify(tree));
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

function processMarkdownFile(content, { sourceFilePath, sidebarOrder, sidebarLabel, editUrl = true, generated = false } = {}) {
	const title = extractTitle(content);
	const stripped = stripFirstH1(content);
	const rewritten = rewriteLinks(stripped, sourceFilePath);
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
	const processed = processMarkdownFile(content, {
		sourceFilePath: srcPath,
		...opts,
	});
	ensureDir(dirname(destPath));
	writeFileSync(destPath, processed);
	log(`${basename(srcPath)} → ${destPath.replace(ROOT, '.')}`);
}

function validateSourcesOrExit() {
	const missingRequired = REQUIRED_SOURCES.filter(source => !SOURCES[source.key]);
	if (missingRequired.length === 0) return;

	const summary = missingRequired.map(source => source.label).join(', ');
	if (STRICT_MODE) {
		console.error(`[sync-content] ERROR: Missing required sources in strict mode: ${summary}`);
		process.exit(1);
	}

	console.warn(`[sync-content] WARNING: Missing recommended sources: ${summary}`);
	console.warn('[sync-content] WARNING: Continuing because strict mode is disabled');
}

function validateRequiredSourceFilesOrExit() {
	const missingRequiredFiles = REQUIRED_SOURCE_FILES.filter(file => {
		const sourceRoot = SOURCES[file.key];
		if (!sourceRoot) return false;
		return !existsSync(join(sourceRoot, file.relativePath));
	});

	if (missingRequiredFiles.length === 0) return;

	const summary = missingRequiredFiles.map(file => file.label).join(', ');
	if (STRICT_MODE) {
		console.error(`[sync-content] ERROR: Missing required source files in strict mode: ${summary}`);
		process.exit(1);
	}

	console.warn(`[sync-content] WARNING: Missing recommended source files: ${summary}`);
	console.warn('[sync-content] WARNING: Continuing because strict mode is disabled');
}

function validateTutorialParts(parts) {
	const errors = [];

	if (parts.length === 0) {
		errors.push('no "## Part N:" headings found');
		return errors;
	}

	for (let i = 0; i < parts.length; i++) {
		const expected = i + 1;
		if (parts[i].number !== expected) {
			errors.push(`part numbering is non-sequential (expected Part ${expected}, found Part ${parts[i].number})`);
			break;
		}
	}

	if (Number.isFinite(EXPECTED_TUTORIAL_PARTS) && parts.length !== EXPECTED_TUTORIAL_PARTS) {
		errors.push(`expected ${EXPECTED_TUTORIAL_PARTS} parts, found ${parts.length}`);
	}

	return errors;
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
	for (const file of DELIVERY_PROCESS_MANUAL_DOCS.guides) {
		const src = join(SOURCES.docs, file.source);
		if (existsSync(src)) {
			const dest = join(guidesDir, `${file.slug}.md`);
			copyAndProcess(src, dest, { sidebarOrder: file.order });
		} else {
			console.warn(`  [sync] WARNING: ${file.source} not found`);
		}
	}

	// Reference
	const refDir = join(DOCS_TARGET, 'reference');
	ensureDir(refDir);
	for (const file of DELIVERY_PROCESS_MANUAL_DOCS.reference) {
		const src = join(SOURCES.docs, file.source);
		if (existsSync(src)) {
			const dest = join(refDir, `${file.slug}.md`);
			copyAndProcess(src, dest, { sidebarOrder: file.order });
		} else {
			console.warn(`  [sync] WARNING: ${file.source} not found`);
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
		console.warn('  [sync] WARNING: delivery-process-tutorials/TUTORIAL-ARTICLE-v1.md not found, skipping tutorial');
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

	const tutorialErrors = validateTutorialParts(parts);
	if (tutorialErrors.length > 0) {
		const summary = tutorialErrors.join('; ');
		if (STRICT_MODE) {
			console.error(`[sync-content] ERROR: Tutorial structure validation failed: ${summary}`);
			process.exit(1);
		}
		console.warn(`  [sync] WARNING: Tutorial structure validation failed: ${summary}`);
	}

	if (parts.length === 0) {
		console.warn('  [sync] WARNING: Tutorial fallback: copying tutorial as a single page');
		copyAndProcess(SOURCES.tutorial, join(targetDir, 'index.md'), { sidebarOrder: 0 });
		return;
	}

	// Extract introduction (content before first part)
	const introContent = content.substring(0, parts[0].startIndex).trim();
	if (introContent) {
		const introProcessed = processMarkdownFile(introContent, {
			sourceFilePath: SOURCES.tutorial,
			sidebarOrder: 0,
			sidebarLabel: 'Introduction',
		});
		writeFileSync(join(targetDir, 'index.md'), introProcessed);
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
			sourceFilePath: SOURCES.tutorial,
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
console.log(`[sync-content] Strict mode: ${STRICT_MODE ? 'ON' : 'OFF'}`);

// Show source resolution
for (const [key, path] of Object.entries(SOURCES)) {
	if (path) {
		log(`Source ${key}: ${path}`);
	} else {
		console.warn(`  [sync] Source ${key}: NOT FOUND`);
	}
}

// Fail fast before cleanup when required source inputs are missing.
validateSourcesOrExit();
validateRequiredSourceFilesOrExit();

// Clean synced directories (but not hand-crafted files at the root)
for (const subdir of DELIVERY_PROCESS_SYNC_SUBDIRS) {
	cleanDir(join(DOCS_TARGET, subdir));
}

syncManualDocs();
syncProductAreas();
syncDecisions();
syncGenerated();
syncTutorial();

console.log('[sync-content] Done!');
