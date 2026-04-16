<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<header class="appHeader">
	<div class="appHeader__mark">
		<span class="appHeader__dot"></span>
		<span class="appHeader__title">XREVENT</span>
		<span class="appHeader__sub">Broadcaster Controls</span>
	</div>
	<span class="eyebrow">v1</span>
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
</style>
