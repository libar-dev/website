// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	// Start with GitHub Pages default; switch to site: 'https://libar.dev' + remove base when DNS is configured
	site: 'https://libar-dev.github.io',
	base: '/website',
	integrations: [
		// MUST come before starlight — ordering is critical for mermaid fences to be processed
		mermaid(),
		starlight({
			title: '@libar-dev',
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
