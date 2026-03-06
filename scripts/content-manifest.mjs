/**
 * Shared documentation manifest for @libar-dev/delivery-process.
 *
 * This file is consumed by both the content sync pipeline and Astro/Starlight
 * config so section structure only lives in one place.
 *
 * Primary content comes from docs-live/ (auto-generated).
 * Only 3 manual guides from docs/ remain (no generated equivalent).
 */

export const DELIVERY_PROCESS_DOCS = {
	label: 'delivery-process',
	slug: 'delivery-process',
	overviewSlug: 'delivery-process',
	gettingStartedSlug: 'delivery-process/getting-started',
};

/**
 * Manual docs from docs/ that have no generated equivalent in docs-live/.
 * These are the only files still synced from the manual docs/ directory.
 */
export const DELIVERY_PROCESS_MANUAL_DOCS = {
	guides: [
		{ source: 'METHODOLOGY.md', slug: 'methodology', order: 1 },
		{ source: 'CONFIGURATION.md', slug: 'configuration', order: 2 },
		{ source: 'GHERKIN-PATTERNS.md', slug: 'gherkin-patterns', order: 3 },
	],
};

export const DELIVERY_PROCESS_SECTIONS = [
	{ label: 'Tutorial', directory: 'tutorial', collapsed: false },
	{ label: 'Architecture', directory: 'architecture', collapsed: false },
	{ label: 'Product Areas', directory: 'product-areas', collapsed: false },
	{ label: 'Reference', directory: 'reference', collapsed: false },
	{ label: 'Business Rules', directory: 'business-rules', collapsed: true },
	{ label: 'Taxonomy', directory: 'taxonomy', collapsed: true },
	{ label: 'Validation', directory: 'validation', collapsed: true },
	{ label: 'Decisions', directory: 'decisions', collapsed: true },
	{ label: 'Guides', directory: 'guides', collapsed: true },
	{ label: 'Changelog', directory: 'changelog', collapsed: true },
];

export const DELIVERY_PROCESS_SYNC_SUBDIRS = DELIVERY_PROCESS_SECTIONS.map(section => section.directory);

function toSectionUrl(section, slug) {
	return `/${DELIVERY_PROCESS_DOCS.slug}/${section}/${slug}/`;
}

const MANUAL_LINK_REWRITES = Object.fromEntries(
	DELIVERY_PROCESS_MANUAL_DOCS.guides.map(file => [`./${file.source}`, toSectionUrl('guides', file.slug)])
);

/**
 * Link rewrites for docs/ files that are no longer synced but may still be
 * referenced by the 3 remaining manual guides. Points to their docs-live/
 * generated equivalents on the website.
 */
const REPLACED_DOCS_LINK_REWRITES = {
	'./ARCHITECTURE.md': `/${DELIVERY_PROCESS_DOCS.slug}/architecture/`,
	'./PROCESS-API.md': `/${DELIVERY_PROCESS_DOCS.slug}/reference/process-api-reference/`,
	'./PROCESS-GUARD.md': `/${DELIVERY_PROCESS_DOCS.slug}/reference/process-guard-reference/`,
	'./ANNOTATION-GUIDE.md': `/${DELIVERY_PROCESS_DOCS.slug}/reference/annotation-reference/`,
	'./SESSION-GUIDES.md': `/${DELIVERY_PROCESS_DOCS.slug}/reference/session-workflow-guide/`,
	'./TAXONOMY.md': `/${DELIVERY_PROCESS_DOCS.slug}/taxonomy/`,
	'./VALIDATION.md': `/${DELIVERY_PROCESS_DOCS.slug}/validation/`,
};

export const DELIVERY_PROCESS_LINK_REWRITES = {
	...MANUAL_LINK_REWRITES,
	...REPLACED_DOCS_LINK_REWRITES,
	'./INDEX.md': `/${DELIVERY_PROCESS_DOCS.slug}/`,
	'../README.md': `/${DELIVERY_PROCESS_DOCS.slug}/getting-started/`,
	'../CHANGELOG.md': 'https://github.com/libar-dev/delivery-process/blob/main/CHANGELOG.md',
	'../SECURITY.md': 'https://github.com/libar-dev/delivery-process/blob/main/SECURITY.md',
	'./PUBLISHING.md': 'https://github.com/libar-dev/delivery-process/blob/main/MAINTAINERS.md',
	'../CLAUDE.md': 'https://github.com/libar-dev/delivery-process/blob/main/CLAUDE.md',
	'../src/taxonomy/': 'https://github.com/libar-dev/delivery-process/tree/main/src/taxonomy/',
	'../tests/features/validation/fsm-validator.feature':
		'https://github.com/libar-dev/delivery-process/blob/main/tests/features/validation/fsm-validator.feature',
	'../tests/features/behavior/session-handoffs.feature':
		'https://github.com/libar-dev/delivery-process/blob/main/tests/features/behavior/session-handoffs.feature',
};

/**
 * Prefix-based rewrites for source links that should point to GitHub.
 * `stripPrefix` allows source markdown paths like `delivery-process/specs/...`
 * to map to repo-root paths like `specs/...`.
 */
export const DELIVERY_PROCESS_LINK_PREFIX_REWRITES = [
	{
		prefix: 'delivery-process/',
		targetPrefix: 'https://github.com/libar-dev/delivery-process/blob/main/',
		stripPrefix: true,
	},
	{
		prefix: 'src/',
		targetPrefix: 'https://github.com/libar-dev/delivery-process/blob/main/',
	},
	{
		prefix: 'tests/',
		targetPrefix: 'https://github.com/libar-dev/delivery-process/blob/main/',
	},
	{
		prefix: 'specs/',
		targetPrefix: 'https://github.com/libar-dev/delivery-process/blob/main/',
	},
	{
		prefix: 'decisions/',
		targetPrefix: 'https://github.com/libar-dev/delivery-process/blob/main/',
	},
	{
		prefix: 'docs/',
		targetPrefix: 'https://github.com/libar-dev/delivery-process/blob/main/',
	},
];

export const DELIVERY_PROCESS_SIDEBAR_GROUP = {
	label: DELIVERY_PROCESS_DOCS.label,
	items: [
		{
			label: 'Overview',
			slug: DELIVERY_PROCESS_DOCS.overviewSlug,
		},
		{
			label: 'Getting Started',
			slug: DELIVERY_PROCESS_DOCS.gettingStartedSlug,
		},
		...DELIVERY_PROCESS_SECTIONS.map(section => ({
			label: section.label,
			collapsed: section.collapsed || undefined,
			autogenerate: {
				directory: `${DELIVERY_PROCESS_DOCS.slug}/${section.directory}`,
			},
		})),
	],
};
