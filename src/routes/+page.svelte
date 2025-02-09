<script lang="ts">
	import '../app.css';
	import RoomListItem from '\$lib/components/roomListItem.svelte';

	type Room = {
		name: string;
		roomParticipants: number;
		roomStreaming: boolean;
		roomLocked: boolean;
	}
	let selectedRoom: undefined | Room = undefined;
	let Rooms: Room[] = [
		{
			name: 'Room1 has a very long name and',
			roomParticipants: 16,
			roomStreaming: true,
			roomLocked: false
		},
		{
			name: 'Room2',
			roomParticipants: 4,
			roomStreaming: false,
			roomLocked: false
		}
	];

	function selectRoom(room: string): void {
		selectedRoom = Rooms.find(r => r.name === room);
	}
</script>


<div class="gridContainer">
	<div class="stroke">
		{#each Rooms as room}
			<RoomListItem {room} {selectRoom}/>
		{/each}
	</div>
	<div class="stroke">
		{#if selectedRoom}
			<h1>{selectedRoom.name}</h1>
			<p>Participants: {selectedRoom.roomParticipants}</p>
			<p>Status: {selectedRoom.roomStreaming}</p>
			<p>Locked: {selectedRoom.roomLocked}</p>
		{:else}
			<h1>No room selected</h1>
		{/if}
	</div>
</div>

<style>
    .gridContainer {
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: 1fr 3fr;
    }

    .stroke {
        margin: 1em;
        border: 1px solid #fff;
        height: 100%;
        color: white;
    }
</style>