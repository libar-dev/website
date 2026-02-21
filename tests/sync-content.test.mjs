import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DOCS_ROOT = resolve(ROOT, 'src/content/docs/delivery-process');
const MARKDOWN_PARSER = unified().use(remarkParse);

function walkMarkdownFiles(dir) {
	const markdownFiles = [];
	for (const entry of readdirSync(dir)) {
		const entryPath = join(dir, entry);
		const stats = statSync(entryPath);
		if (stats.isDirectory()) {
			markdownFiles.push(...walkMarkdownFiles(entryPath));
			continue;
		}
		if (entry.endsWith('.md') || entry.endsWith('.mdx')) {
			markdownFiles.push(entryPath);
		}
	}
	return markdownFiles;
}

function isUnresolvedRelativeLink(url) {
	return !(
		url.startsWith('/') ||
		url.startsWith('#') ||
		url.startsWith('http://') ||
		url.startsWith('https://') ||
		url.startsWith('mailto:') ||
		url.startsWith('tel:')
	);
}

test('sync-content strict mode succeeds and generates expected docs structure', () => {
	const sync = spawnSync('node', ['scripts/sync-content.mjs', '--strict'], {
		cwd: ROOT,
		env: { ...process.env, CI: 'true' },
		encoding: 'utf8',
	});

	assert.equal(sync.status, 0, `sync-content failed:\n${sync.stdout}\n${sync.stderr}`);

	const requiredFiles = [
		'index.mdx',
		'getting-started.md',
		'guides/methodology.md',
		'reference/architecture.md',
		'product-areas/index.md',
		'decisions/index.md',
		'generated/business-rules/index.md',
		'tutorial/index.md',
		'tutorial/10-advanced-process-data-api.md',
	];

	for (const file of requiredFiles) {
		const fullPath = resolve(DOCS_ROOT, file);
		assert.ok(existsSync(fullPath), `Missing synced file: ${file}`);
	}
});

test('sync-content rewrites key links to stable site URLs', () => {
	const guide = readFileSync(resolve(DOCS_ROOT, 'guides/configuration.md'), 'utf8');
	assert.ok(
		guide.includes('](/delivery-process/getting-started/)'),
		'Expected README link to be rewritten to /delivery-process/getting-started/'
	);
	assert.ok(!guide.includes('](../README.md)'), 'Expected no remaining ../README.md links');
	assert.ok(
		guide.includes('](/delivery-process/reference/taxonomy/)'),
		'Expected taxonomy link to be rewritten to /delivery-process/reference/taxonomy/'
	);
	assert.ok(!guide.includes('](./TAXONOMY.md)'), 'Expected no remaining ./TAXONOMY.md links');

	const generatedReference = readFileSync(resolve(DOCS_ROOT, 'generated/reference-sample.md'), 'utf8');
	assert.ok(
		generatedReference.includes('](https://github.com/libar-dev/delivery-process/blob/main/src/config/factory.ts)'),
		'Expected source code links to be rewritten to GitHub URLs'
	);
});

test('sync-content does not leave unresolved relative markdown links', () => {
	const unresolvedLinks = [];
	for (const markdownFile of walkMarkdownFiles(DOCS_ROOT)) {
		const fileContent = readFileSync(markdownFile, 'utf8');
		const tree = MARKDOWN_PARSER.parse(fileContent);
		visit(tree, ['link', 'image'], node => {
			if (isUnresolvedRelativeLink(node.url)) {
				unresolvedLinks.push({
					file: markdownFile.replace(`${ROOT}/`, ''),
					url: node.url,
				});
			}
		});
	}

	assert.equal(
		unresolvedLinks.length,
		0,
		`Expected no unresolved relative links, found:\n${JSON.stringify(unresolvedLinks, null, 2)}`
	);
});

test('tutorial remains split into 10 ordered parts', () => {
	const tutorialDir = resolve(DOCS_ROOT, 'tutorial');
	const parts = readdirSync(tutorialDir)
		.filter(file => /^\d{2}-.*\.md$/.test(file))
		.sort();

	assert.equal(parts.length, 10, `Expected 10 tutorial parts, found ${parts.length}`);
	assert.equal(parts[0], '01-project-setup.md');
	assert.equal(parts[9], '10-advanced-process-data-api.md');
});

test('sync-content strict mode fails when required source files are missing', () => {
	const fixtureRoot = mkdtempSync(join(tmpdir(), 'sync-content-missing-'));

	try {
		const docs = join(fixtureRoot, 'docs');
		const docsLive = join(fixtureRoot, 'docs-live');
		const docsGenerated = join(fixtureRoot, 'docs-generated');
		const tutorial = join(fixtureRoot, 'TUTORIAL-ARTICLE-v1.md');

		mkdirSync(docs, { recursive: true });
		mkdirSync(docsLive, { recursive: true });
		mkdirSync(docsGenerated, { recursive: true });
		writeFileSync(tutorial, '# Tutorial\n\n## Part 1: Start\n');

		const sync = spawnSync('node', ['scripts/sync-content.mjs', '--strict'], {
			cwd: ROOT,
			env: {
				...process.env,
				CI: 'true',
				SYNC_SOURCE_DOCS: docs,
				SYNC_SOURCE_DOCS_LIVE: docsLive,
				SYNC_SOURCE_DOCS_GENERATED: docsGenerated,
				SYNC_SOURCE_TUTORIAL: tutorial,
			},
			encoding: 'utf8',
		});

		assert.notEqual(sync.status, 0, 'Expected strict sync to fail for missing source files');
		assert.match(sync.stderr, /Missing required source files in strict mode/);
	} finally {
		rmSync(fixtureRoot, { recursive: true, force: true });
	}
});
