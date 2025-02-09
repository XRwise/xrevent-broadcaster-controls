<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="headerBar">
	<div class="titel">
	<h1>XRevent Broadcaster controls</h1>
	</div>
</div>

{@render children()}

<style>
	.headerBar {
		color: white;
		padding: 0em 1em;
		text-align: left;
	}
	.titel {
			font-family: "Droid Sans Mono", monospace;
			font-size: 3em;
			font-weight: bold;
	}
</style>