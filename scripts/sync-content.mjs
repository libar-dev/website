/**
 * sync-content.mjs — Build-time content pipeline
 *
 * Copies markdown from delivery-process npm package and delivery-process-tutorials repo,
 * injects Starlight frontmatter, strips H1, rewrites internal links,
 * and splits the tutorial into 10 parts.
 *
 * Primary content comes from docs-live/ (auto-generated from source code).
 * Only 3 manual guides from docs/ remain (METHODOLOGY, CONFIGURATION, GHERKIN-PATTERNS).
 *
 * Sources (local dev):
 *   ../delivery-process/docs/          → manual guides (3 files)
 *   ../delivery-process/docs-live/     → auto-generated (all other sections)
 *   ../delivery-process-tutorials/TUTORIAL-ARTICLE-v1.md → tutorial
 *
 * Sources (CI — tutorial repo checked out as sibling; delivery-process via node_modules):
 *   ./delivery-process-tutorials/TUTORIAL-ARTICLE-v1.md
 *   node_modules/@libar-dev/delivery-process/{docs,docs-live}
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
	{ key: 'tutorial', label: 'delivery-process-tutorials/TUTORIAL-ARTICLE-v1.md' },
];
const REQUIRED_SOURCE_FILES = [
	...DELIVERY_PROCESS_MANUAL_DOCS.guides.map(file => ({
		key: 'docs',
		relativePath: file.source,
		label: `delivery-process/docs/${file.source}`,
	})),
	{ key: 'docsLive', relativePath: 'ARCHITECTURE.md', label: 'delivery-process/docs-live/ARCHITECTURE.md' },
	{ key: 'docsLive', relativePath: 'PRODUCT-AREAS.md', label: 'delivery-process/docs-live/PRODUCT-AREAS.md' },
	{ key: 'docsLive', relativePath: 'DECISIONS.md', label: 'delivery-process/docs-live/DECISIONS.md' },
	{ key: 'docsLive', relativePath: 'BUSINESS-RULES.md', label: 'delivery-process/docs-live/BUSINESS-RULES.md' },
	{ key: 'docsLive', relativePath: 'TAXONOMY.md', label: 'delivery-process/docs-live/TAXONOMY.md' },
	{ key: 'docsLive', relativePath: 'VALIDATION-RULES.md', label: 'delivery-process/docs-live/VALIDATION-RULES.md' },
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

function getSyncedRouteForSourceFile(sourceFilePath) {
	const docsRel = getSourceRelativePath(SOURCES.docs, sourceFilePath);
	if (docsRel) {
		if (docsRel === 'INDEX.md') return `/${DELIVERY_PROCESS_DOCS.slug}/`;
		if (docsRel === 'README.md') return `/${DELIVERY_PROCESS_DOCS.slug}/getting-started/`;
		if (GUIDE_SOURCE_TO_SLUG.has(docsRel)) return toDocsRoute('guides', GUIDE_SOURCE_TO_SLUG.get(docsRel));
		// Catch-all: docs/ files not synced to the website → link to GitHub
		if (docsRel.endsWith('.md'))
			return `https://github.com/libar-dev/delivery-process/blob/main/docs/${docsRel}`;
	}

	const docsLiveRel = getSourceRelativePath(SOURCES.docsLive, sourceFilePath);
	if (docsLiveRel) {
		// Architecture
		if (docsLiveRel === 'ARCHITECTURE.md') return toDocsRoute('architecture', '');
		if (docsLiveRel === 'reference/ARCHITECTURE-CODECS.md') return toDocsRoute('architecture', 'codecs');
		if (docsLiveRel === 'reference/ARCHITECTURE-TYPES.md') return toDocsRoute('architecture', 'types');
		// Product areas
		if (docsLiveRel === 'PRODUCT-AREAS.md') return toDocsRoute('product-areas', '');
		if (/^product-areas\/.+\.md$/i.test(docsLiveRel)) {
			const slug = basename(docsLiveRel, '.md').toLowerCase();
			return toDocsRoute('product-areas', slug);
		}
		// Reference (from docs-live/reference/)
		if (docsLiveRel === 'reference/PROCESS-API-REFERENCE.md') return toDocsRoute('reference', 'process-api-reference');
		if (docsLiveRel === 'reference/PROCESS-API-RECIPES.md') return toDocsRoute('reference', 'process-api-recipes');
		if (docsLiveRel === 'reference/PROCESS-GUARD-REFERENCE.md') return toDocsRoute('reference', 'process-guard-reference');
		if (docsLiveRel === 'reference/ANNOTATION-REFERENCE.md') return toDocsRoute('reference', 'annotation-reference');
		if (docsLiveRel === 'reference/SESSION-WORKFLOW-GUIDE.md') return toDocsRoute('reference', 'session-workflow-guide');
		if (docsLiveRel === 'reference/REFERENCE-SAMPLE.md') return toDocsRoute('reference', 'reference-sample');
		// Business rules
		if (docsLiveRel === 'BUSINESS-RULES.md') return toDocsRoute('business-rules', '');
		if (/^business-rules\/.+\.md$/i.test(docsLiveRel)) {
			const slug = basename(docsLiveRel, '.md').toLowerCase();
			return toDocsRoute('business-rules', slug);
		}
		// Taxonomy
		if (docsLiveRel === 'TAXONOMY.md') return toDocsRoute('taxonomy', '');
		if (/^taxonomy\/.+\.md$/i.test(docsLiveRel)) {
			const slug = basename(docsLiveRel, '.md').toLowerCase();
			return toDocsRoute('taxonomy', slug);
		}
		// Validation
		if (docsLiveRel === 'VALIDATION-RULES.md') return toDocsRoute('validation', '');
		if (/^validation\/.+\.md$/i.test(docsLiveRel)) {
			const slug = basename(docsLiveRel, '.md').toLowerCase();
			return toDocsRoute('validation', slug);
		}
		// Decisions
		if (docsLiveRel === 'DECISIONS.md') return toDocsRoute('decisions', '');
		if (/^decisions\/.+\.md$/i.test(docsLiveRel)) {
			const slug = basename(docsLiveRel, '.md').toLowerCase();
			return toDocsRoute('decisions', slug);
		}
		// Changelog
		if (docsLiveRel === 'CHANGELOG-GENERATED.md') return toDocsRoute('changelog', '');
		// Catch-all: unsynced docs-live markdown files → link to GitHub
		if (docsLiveRel.endsWith('.md'))
			return `https://github.com/libar-dev/delivery-process/blob/main/docs-live/${docsLiveRel}`;
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

// ── Sync: docs-live/ helper ──

/** Sync an index file + subdirectory of .md files from docs-live/ */
function syncDocsLiveSection(indexFile, subDir, targetDirName, { indexLabel, startOrder = 0 } = {}) {
	if (!SOURCES.docsLive) return;

	const targetDir = join(DOCS_TARGET, targetDirName);
	ensureDir(targetDir);

	// Index file
	const indexSrc = join(SOURCES.docsLive, indexFile);
	if (existsSync(indexSrc)) {
		copyAndProcess(indexSrc, join(targetDir, 'index.md'), {
			sidebarOrder: startOrder,
			sidebarLabel: indexLabel || 'Overview',
			editUrl: false,
			generated: true,
		});
	}

	// Subdirectory files
	if (subDir) {
		const srcDir = join(SOURCES.docsLive, subDir);
		if (existsSync(srcDir)) {
			let order = startOrder + 1;
			for (const file of readdirSync(srcDir).filter(f => f.endsWith('.md')).sort()) {
				copyAndProcess(join(srcDir, file), join(targetDir, file.toLowerCase()), {
					sidebarOrder: order++,
					editUrl: false,
					generated: true,
				});
			}
		}
	}
}

// ── Sync functions ──

function syncManualDocs() {
	if (!SOURCES.docs) {
		console.warn('  [sync] WARNING: delivery-process/docs/ not found, skipping manual docs');
		return;
	}

	console.log('  [sync] Syncing manual guides...');

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
}

function syncArchitecture() {
	if (!SOURCES.docsLive) return;
	console.log('  [sync] Syncing architecture...');

	const targetDir = join(DOCS_TARGET, 'architecture');
	ensureDir(targetDir);

	// Main architecture overview
	const archSrc = join(SOURCES.docsLive, 'ARCHITECTURE.md');
	if (existsSync(archSrc)) {
		copyAndProcess(archSrc, join(targetDir, 'index.md'), {
			sidebarOrder: 0,
			sidebarLabel: 'Overview',
			editUrl: false,
			generated: true,
		});
	}

	// Architecture sub-docs from reference/
	const codecs = join(SOURCES.docsLive, 'reference', 'ARCHITECTURE-CODECS.md');
	if (existsSync(codecs)) {
		copyAndProcess(codecs, join(targetDir, 'codecs.md'), { sidebarOrder: 1, editUrl: false, generated: true });
	}

	const types = join(SOURCES.docsLive, 'reference', 'ARCHITECTURE-TYPES.md');
	if (existsSync(types)) {
		copyAndProcess(types, join(targetDir, 'types.md'), { sidebarOrder: 2, editUrl: false, generated: true });
	}
}

function syncReference() {
	if (!SOURCES.docsLive) return;
	console.log('  [sync] Syncing reference docs...');

	const targetDir = join(DOCS_TARGET, 'reference');
	ensureDir(targetDir);

	const refFiles = [
		{ source: 'PROCESS-API-REFERENCE.md', slug: 'process-api-reference', order: 1 },
		{ source: 'PROCESS-API-RECIPES.md', slug: 'process-api-recipes', order: 2 },
		{ source: 'PROCESS-GUARD-REFERENCE.md', slug: 'process-guard-reference', order: 3 },
		{ source: 'ANNOTATION-REFERENCE.md', slug: 'annotation-reference', order: 4 },
		{ source: 'SESSION-WORKFLOW-GUIDE.md', slug: 'session-workflow-guide', order: 5 },
		{ source: 'REFERENCE-SAMPLE.md', slug: 'reference-sample', order: 6 },
	];

	for (const file of refFiles) {
		const src = join(SOURCES.docsLive, 'reference', file.source);
		if (existsSync(src)) {
			copyAndProcess(src, join(targetDir, `${file.slug}.md`), {
				sidebarOrder: file.order,
				editUrl: false,
				generated: true,
			});
		}
	}
}

function syncProductAreas() {
	if (!SOURCES.docsLive) return;
	console.log('  [sync] Syncing product areas...');
	syncDocsLiveSection('PRODUCT-AREAS.md', 'product-areas', 'product-areas');
}

function syncBusinessRules() {
	if (!SOURCES.docsLive) return;
	console.log('  [sync] Syncing business rules...');
	syncDocsLiveSection('BUSINESS-RULES.md', 'business-rules', 'business-rules', { indexLabel: 'Business Rules' });
}

function syncTaxonomy() {
	if (!SOURCES.docsLive) return;
	console.log('  [sync] Syncing taxonomy...');
	syncDocsLiveSection('TAXONOMY.md', 'taxonomy', 'taxonomy', { indexLabel: 'Taxonomy' });
}

function syncValidation() {
	if (!SOURCES.docsLive) return;
	console.log('  [sync] Syncing validation...');
	syncDocsLiveSection('VALIDATION-RULES.md', 'validation', 'validation', { indexLabel: 'Validation Rules' });
}

function syncDecisions() {
	if (!SOURCES.docsLive) return;
	console.log('  [sync] Syncing architecture decisions...');
	syncDocsLiveSection('DECISIONS.md', 'decisions', 'decisions');
}

function syncChangelog() {
	if (!SOURCES.docsLive) return;
	console.log('  [sync] Syncing changelog...');

	const targetDir = join(DOCS_TARGET, 'changelog');
	ensureDir(targetDir);

	const src = join(SOURCES.docsLive, 'CHANGELOG-GENERATED.md');
	if (existsSync(src)) {
		copyAndProcess(src, join(targetDir, 'index.md'), {
			sidebarOrder: 0,
			editUrl: false,
			generated: true,
		});
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
syncArchitecture();
syncProductAreas();
syncReference();
syncBusinessRules();
syncTaxonomy();
syncValidation();
syncDecisions();
syncChangelog();
syncTutorial();

console.log('[sync-content] Done!');
