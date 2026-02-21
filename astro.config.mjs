// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// Custom code block theme — always dark, warm muted palette matching the landing page.
// Colors sourced from tokens.css --dp-syn-* variables (hardcoded here since
// Shiki themes are JS objects, not CSS).
const libarDark = {
	name: 'libar-dark',
	type: 'dark',
	colors: {
		'editor.background': '#111111',
		'editor.foreground': '#d4cdc4',
		'editor.lineHighlightBackground': '#1a1a1a',
		'editorCursor.foreground': '#e8530e',
		'editorLineNumber.foreground': '#3a3530',
		'editorLineNumber.activeForeground': '#5a5550',
	},
	tokenColors: [
		{
			scope: ['comment', 'comment.line', 'comment.block', 'punctuation.definition.comment'],
			settings: { foreground: '#5a5550' },
		},
		{
			scope: [
				'keyword',
				'keyword.control',
				'keyword.operator.new',
				'storage.type',
				'storage.modifier',
				'keyword.other',
			],
			settings: { foreground: '#e0dcd6', fontStyle: 'bold' },
		},
		{
			scope: [
				'entity.name.function',
				'support.function',
				'meta.function-call entity.name.function',
			],
			settings: { foreground: '#c8bfb4' },
		},
		{
			scope: [
				'entity.name.type',
				'entity.name.class',
				'support.type',
				'support.class',
				'entity.other.inherited-class',
			],
			settings: { foreground: '#d4cdc4' },
		},
		{
			scope: ['string', 'string.quoted', 'string.template', 'string.regexp'],
			settings: { foreground: '#c49a6c' },
		},
		{
			scope: ['constant.numeric', 'constant.language', 'constant.character.escape'],
			settings: { foreground: '#c49a6c' },
		},
		{
			scope: [
				'support.type.property-name',
				'meta.property-name',
				'variable.other.property',
				'entity.name.tag',
			],
			settings: { foreground: '#b5a898' },
		},
		{
			scope: ['keyword.operator', 'punctuation.separator', 'punctuation.accessor'],
			settings: { foreground: '#7a756e' },
		},
		{
			scope: ['variable', 'variable.other', 'variable.parameter'],
			settings: { foreground: '#d4cdc4' },
		},
		// Gherkin (.feature files)
		{
			scope: [
				'keyword.control.cucumber',
				'entity.name.function.cucumber',
				'storage.type.feature.cucumber',
			],
			settings: { foreground: '#e0dcd6', fontStyle: 'bold' },
		},
		{
			scope: ['entity.name.type.feature.cucumber', 'string.unquoted.feature.cucumber'],
			settings: { foreground: '#c49a6c' },
		},
		{
			scope: ['meta.tag.cucumber', 'entity.name.tag.cucumber'],
			settings: { foreground: '#b5a898' },
		},
	],
};

// https://astro.build/config
export default defineConfig({
	site: 'https://libar.dev',
	integrations: [
		// MUST come before starlight — ordering is critical for mermaid fences to be processed
		mermaid(),
		starlight({
			expressiveCode: {
				themes: [libarDark],
				styleOverrides: {
					borderRadius: '0px',
					borderColor: '#222222',
					codeFontSize: '0.8rem',
					frames: {
						editorTabBarBackground: '#1a1a1a',
						editorActiveTabBackground: '#111111',
						editorActiveTabBorderColor: '#e8530e',
						frameBoxShadowCssValue: 'none',
					},
				},
			},
			title: '@libar-dev',
			tableOfContents: false,
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/libar-dev',
				},
			],
			customCss: ['./src/styles/tokens.css', './src/styles/starlight-overrides.css'],
			head: [
				{
					tag: 'link',
					attrs: {
						rel: 'preconnect',
						href: 'https://fonts.googleapis.com',
					},
				},
				{
					tag: 'link',
					attrs: {
						rel: 'preconnect',
						href: 'https://fonts.gstatic.com',
						crossorigin: true,
					},
				},
				{
					tag: 'link',
					attrs: {
						href: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=JetBrains+Mono:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap',
						rel: 'stylesheet',
					},
				},
			],
			sidebar: [
				{
					label: 'delivery-process',
					items: [
						{
							label: 'Overview',
							slug: 'delivery-process',
						},
						{
							label: 'Getting Started',
							slug: 'delivery-process/getting-started',
						},
						{
							label: 'Tutorial',
							autogenerate: { directory: 'delivery-process/tutorial' },
						},
						{
							label: 'Guides',
							autogenerate: { directory: 'delivery-process/guides' },
						},
						{
							label: 'Reference',
							autogenerate: { directory: 'delivery-process/reference' },
						},
						{
							label: 'Product Areas',
							autogenerate: { directory: 'delivery-process/product-areas' },
						},
						{
							label: 'Architecture Decisions',
							collapsed: true,
							autogenerate: { directory: 'delivery-process/decisions' },
						},
						{
							label: 'Generated Reference',
							collapsed: true,
							autogenerate: { directory: 'delivery-process/generated' },
						},
					],
				},
			],
		}),
	],
});
