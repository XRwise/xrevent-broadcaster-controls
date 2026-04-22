<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	let { children } = $props();
</script>

<header class="appHeader">
	<a href="/" class="appHeader__mark">
		<span class="appHeader__dot"></span>
		<span class="appHeader__title">XREVENT</span>
		<span class="appHeader__sub">Broadcaster Controls</span>
	</a>
	<nav class="appHeader__meta" aria-label="Rechtliches">
		<a
			href="/impressum"
			class="eyebrow appHeader__link"
			aria-current={page.url.pathname === '/impressum' ? 'page' : undefined}>Impressum</a
		>
		<a
			href="/datenschutz"
			class="eyebrow appHeader__link"
			aria-current={page.url.pathname === '/datenschutz' ? 'page' : undefined}>Datenschutz</a
		>
		<span class="eyebrow">v1</span>
	</nav>
</header>

{@render children()}

<style>
	.appHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.25rem;
		border-bottom: 1px solid var(--border);
		background: var(--bg);
	}
	.appHeader__mark {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		text-decoration: none;
		color: inherit;
	}
	.appHeader__dot {
		width: 0.55rem;
		height: 0.55rem;
		background: var(--fg);
		align-self: center;
	}
	.appHeader__title {
		font-family: var(--font-mono);
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: 0.18em;
	}
	.appHeader__sub {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--fg-muted);
	}
	.appHeader__meta {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	.appHeader__link {
		text-decoration: none;
		border-bottom: 1px solid transparent;
		padding-bottom: 1px;
		transition:
			color 120ms ease,
			border-color 120ms ease;
	}
	.appHeader__link:hover {
		color: var(--fg);
		border-bottom-color: var(--border-muted);
	}
	.appHeader__link[aria-current='page'] {
		color: var(--fg);
		border-bottom-color: var(--border);
	}
</style>
