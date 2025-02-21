<script lang="ts">
	import RoomListItem from '\$lib/components/roomListItem.svelte';
	import { Room } from 'livekit-client';
	let {Rooms,selectRoom,refreshRooms,selectedRoom}:{Rooms : Room[]|undefined,selectRoom: (roomName:string)=>void,refreshRooms: ()=>void,selectedRoom:string|undefined} = $props();
	let roomNameToCreate: string =  $state("");
</script>

<div class="stroke expand ListContainer">
	{#if Rooms}{#each Rooms as room}
		<RoomListItem {room} {selectRoom} {selectedRoom}/>
	{/each}{/if}
	<div class="refresh">
		<button onclick={()=>refreshRooms()}>
			Reload
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise" viewBox="0 0 16 16">
				<path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
				<path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
			</svg>
		</button>
	</div>
	<div class="spacer"></div>
	<div class="addRoomContainer stroke">
		<svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" fill="currentColor" class="bi bi-plus-circle-fill" viewBox="0 0 16 16">
			<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z"/>
		</svg>
		<input type="text" bind:value={roomNameToCreate} placeholder="Room Name"/>
		<button onclick={()=>selectRoom(roomNameToCreate || "Gas Station")}>Create Room</button>
	</div>
</div>

<style>
.stroke {
	border: 1px solid #fff;
	color: white;
}
.expand{
    height: 100%;
    margin: 1em;
}
.ListContainer{
		display: flex;
		flex-direction: column;
}
.refresh {
		text-align: center;
		padding: 0.5em;
		background-color: #666666;
		margin: 1em;
		border-radius: 1em;
}
.spacer{
		flex-grow: 10;
}
.addRoomContainer {
		align-self: center;
		align-items: center;
		display: flex;
		padding: 1em;
		background-color: #222;
}
.addRoomContainer input {
    border-bottom: 1px solid #fff;
		margin: 0.5em;
}
</style>