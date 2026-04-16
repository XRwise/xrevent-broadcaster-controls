<script lang="ts">
	import RoomListItem from '$lib/components/roomListItem.svelte';
	import { Room } from 'livekit-client';

	let {
		Rooms,
		selectRoom,
		refreshRooms,
		selectedRoom
	}: {
		Rooms: Room[] | undefined;
		selectRoom: (roomName: string) => void;
		refreshRooms: () => void;
		selectedRoom: string | undefined;
	} = $props();

	let roomNameToCreate: string = $state('');
</script>

<aside class="panel roomList">
	<header class="panel__header">
		<span>Rooms</span>
		<button class="btn btn--ghost btn--icon" title="Refresh" onclick={() => refreshRooms()}>
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
				<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z" />
				<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
			</svg>
		</button>
	</header>

	<div class="roomList__items">
		{#if Rooms && Rooms.length > 0}
			{#each Rooms as room}
				<RoomListItem {room} {selectRoom} {selectedRoom} />
			{/each}
		{:else}
			<p class="roomList__empty eyebrow">No rooms yet</p>
		{/if}
	</div>

	<footer class="roomList__create">
		<label class="eyebrow" for="new-room">New room</label>
		<input
			id="new-room"
			class="input"
			type="text"
			bind:value={roomNameToCreate}
			placeholder="room name…"
		/>
		<button
			class="btn btn--primary btn--block"
			onclick={() => selectRoom(roomNameToCreate || 'Gas Station')}
		>
			Create + Join
		</button>
	</footer>
</aside>

<style>
	.roomList {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.roomList__items {
		flex: 1 1 auto;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		padding: 0.75rem;
		gap: 0.5rem;
	}

	.roomList__empty {
		padding: 1.5rem 0.5rem;
		text-align: center;
	}

	.roomList__create {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem 1rem 1rem;
		border-top: 1px solid var(--border-muted);
	}
</style>
