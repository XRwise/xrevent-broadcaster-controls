<script lang="ts">
	import '../app.css';
	import { ConnectionState, Room } from 'livekit-client';

	import type { PageProps } from './$types';
	import RoomList from '$lib/components/RoomList.svelte';
	import RoomItem from '$lib/components/roomItem.svelte';

	let LIVEKIT_URL = 'wss://xrevent-broadcaster-kwyy7b3z.livekit.cloud';
	let livekitToken: string | undefined = undefined;

	let { data }: PageProps = $props();
	let Rooms: Room[] | undefined = $state(undefined);
	let selectedRoom: Room | undefined = $state(undefined);
	console.log(data);
	Rooms = JSON.parse(data.rooms);

	async function getRooms(): Promise<string> {
		const response = await fetch('/api/livekit-rooms', { method: 'GET' });
		let x = await response.text();
		console.log(JSON.parse(x));
		return x;
	}

	async function refreshRooms() {
		Rooms = JSON.parse(await getRooms());
	}

	async function getViewerToken(name: string, room: string): Promise<string> {
		const response = await fetch('/api/livekit-token?participantName=' + name + '&room=' + room, {
			method: 'GET'
		});
		return await response.text();
	}

	function guidGenerator() {
		const S4 = function () {
			return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
		};
		return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
	}

	function connectToRoom(room: Room, roomName: string) {
		getViewerToken('Viewer-' + guidGenerator(), roomName).then((token) => {
			livekitToken = token;
			room.connect(LIVEKIT_URL, token).then(() => {
				console.log('Connected to: ' + room.name);
				refreshRooms();
			});
			console.log(roomName + ' | real Name: ' + room.name);
		});
	}

	function selectRoom(roomName: string = 'null'): void {
		if (selectedRoom?.state == ConnectionState.Connected) selectedRoom.disconnect();
		selectedRoom = undefined;
		if (roomName == 'null') return;
		if (selectedRoom == undefined) {
			selectedRoom = new Room();
		}
		connectToRoom(selectedRoom, roomName);
	}
</script>

<main class="workspace">
	<RoomList {selectRoom} {refreshRooms} {Rooms} selectedRoom={selectedRoom?.name} />

	<section class="workspace__stage panel">
		{#if selectedRoom !== undefined}
			<RoomItem {selectRoom} bind:selectedRoom />
		{:else}
			<div class="emptyState">
				<span class="eyebrow">No room selected</span>
				<p class="emptyState__hint">Pick a room from the list, or create a new one to begin.</p>
			</div>
		{/if}
	</section>
</main>

<style>
	.workspace {
		display: grid;
		grid-template-columns: minmax(260px, 1fr) 3fr;
		gap: 1rem;
		padding: 1rem;
		height: calc(100vh - 3.25rem); /* viewport minus header */
		box-sizing: border-box;
	}

	.workspace__stage {
		display: flex;
		min-height: 0; /* lets inner grid actually shrink */
	}

	.emptyState {
		margin: auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 3rem;
	}
	.emptyState__hint { color: var(--fg-muted); }
</style>
