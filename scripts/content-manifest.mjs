/**
 * Shared documentation manifest for @libar-dev/delivery-process.
 *
 * This file is consumed by both the content sync pipeline and Astro/Starlight
 * config so section structure only lives in one place.
 */

export const DELIVERY_PROCESS_DOCS = {
	label: 'delivery-process',
	slug: 'delivery-process',
	overviewSlug: 'delivery-process',
	gettingStartedSlug: 'delivery-process/getting-started',
};

export const DELIVERY_PROCESS_MANUAL_DOCS = {
	guides: [
		{ source: 'METHODOLOGY.md', slug: 'methodology', order: 1 },
		{ source: 'CONFIGURATION.md', slug: 'configuration', order: 2 },
		{ source: 'SESSION-GUIDES.md', slug: 'session-guides', order: 3 },
		{ source: 'GHERKIN-PATTERNS.md', slug: 'gherkin-patterns', order: 4 },
		{ source: 'ANNOTATION-GUIDE.md', slug: 'annotation-guide', order: 5 },
		{ source: 'PUBLISHING.md', slug: 'publishing', order: 6 },
	],
	reference: [
		{ source: 'ARCHITECTURE.md', slug: 'architecture', order: 1 },
		{ source: 'PROCESS-API.md', slug: 'process-api', order: 2 },
		{ source: 'PROCESS-GUARD.md', slug: 'process-guard', order: 3 },
		{ source: 'VALIDATION.md', slug: 'validation', order: 4 },
		{ source: 'TAXONOMY.md', slug: 'taxonomy', order: 5 },
	],
};

export const DELIVERY_PROCESS_SECTIONS = [
	{ label: 'Tutorial', directory: 'tutorial', collapsed: false },
	{ label: 'Guides', directory: 'guides', collapsed: false },
	{ label: 'Reference', directory: 'reference', collapsed: false },
	{ label: 'Product Areas', directory: 'product-areas', collapsed: false },
	{ label: 'Architecture Decisions', directory: 'decisions', collapsed: true },
	{ label: 'Generated Reference', directory: 'generated', collapsed: true },
];

export const DELIVERY_PROCESS_SYNC_SUBDIRS = DELIVERY_PROCESS_SECTIONS.map(section => section.directory);

function toSectionUrl(section, slug) {
	return `/${DELIVERY_PROCESS_DOCS.slug}/${section}/${slug}/`;
}

const MANUAL_LINK_REWRITES = Object.fromEntries(
	Object.entries(DELIVERY_PROCESS_MANUAL_DOCS).flatMap(([section, files]) =>
		files.map(file => [`./${file.source}`, toSectionUrl(section, file.slug)])
	),
);

export const DELIVERY_PROCESS_LINK_REWRITES = {
	...MANUAL_LINK_REWRITES,
	'./INDEX.md': `/${DELIVERY_PROCESS_DOCS.slug}/`,
	'../README.md': `/${DELIVERY_PROCESS_DOCS.slug}/getting-started/`,
	'../CHANGELOG.md': 'https://github.com/libar-dev/delivery-process/blob/main/CHANGELOG.md',
	'../SECURITY.md': 'https://github.com/libar-dev/delivery-process/blob/main/SECURITY.md',
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
