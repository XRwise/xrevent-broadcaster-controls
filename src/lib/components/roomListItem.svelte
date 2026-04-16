<script lang="ts">
	import { Room } from 'livekit-client';
	let {
		room,
		selectRoom,
		selectedRoom
	}: {
		room: Room;
		selectRoom: (name: string) => void;
		selectedRoom: string | undefined;
	} = $props();

	let isSelected = $derived(selectedRoom === room.name);
	let isLive = $derived(room.numPublishers > 0);
</script>

<button
	class="roomRow"
	class:roomRow--selected={isSelected}
	aria-pressed={isSelected}
	onclick={() => selectRoom(room.name)}
>
	<span class="indicator-dot" class:indicator-dot--live={isLive}></span>
	<span class="roomRow__name">{room.name}</span>

	{#if isLive}
		<span class="badge badge--live">Live</span>
	{/if}

	<span class="roomRow__count">
		<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
			<path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275Z" />
		</svg>
		{room.numParticipants}
	</span>
</button>

<style>
	.roomRow {
		display: grid;
		grid-template-columns: auto 1fr auto auto;
		align-items: center;
		gap: 0.6rem;
		width: 100%;
		padding: 0.65rem 0.85rem;
		border: 1px solid var(--border-muted);
		background: transparent;
		color: var(--fg);
		text-align: left;
		transition: border-color var(--t-fast), background var(--t-fast);
	}

	.roomRow:hover {
		border-color: var(--border);
		background: var(--bg-hover);
	}

	.roomRow--selected {
		border-color: var(--border);
		background: var(--bg-active);
	}

	.roomRow__name {
		font-family: var(--font-mono);
		font-size: 0.95rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.roomRow__count {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		color: var(--fg-muted);
		font-family: var(--font-mono);
		font-size: 0.8rem;
	}
</style>
