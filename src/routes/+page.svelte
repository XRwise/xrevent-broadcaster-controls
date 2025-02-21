<script lang="ts">
	import '../app.css';
	import { ConnectionState, Room } from 'livekit-client';

	import type { PageProps } from './$types';
	import RoomList from '$lib/components/RoomList.svelte';
	import RoomItem from '\$lib/components/roomItem.svelte';

	let LIVEKIT_URL="wss://xrevent-broadcaster-kwyy7b3z.livekit.cloud"
	let livekitToken: string | undefined = undefined;

	let { data }: PageProps = $props();
	let Rooms: Room[] | undefined = $state(undefined);
	let selectedRoom: Room | undefined = $state(undefined);
	console.log(data);
	Rooms = JSON.parse(data.rooms);


	async function getRooms(): Promise<string>{
		const response = await fetch('/api/livekit-rooms',{
			method: 'GET'
		});
		let x = await response.text();
		console.log(JSON.parse(x));
		return x;
	}

	async function refreshRooms() {
		Rooms = JSON.parse(await getRooms());
	}
	//ask the Sveltekit Server for a token
	async function getViewerToken(name: string, room: string): Promise<string>{
		const response = await fetch('/api/livekit-token?participantName=' + name + "&room=" + room, {
			method: 'GET'
		});
		return await response.text();
	}
	function guidGenerator() {
		const S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}

	function connectToRoom(room: Room, roomName:string){
		getViewerToken('Viewer-' + guidGenerator(),roomName).then(token => {
			livekitToken = token;
			room.connect(LIVEKIT_URL,token).then(() =>{
					console.log("Connected to: " + room.name);
					refreshRooms();
				}
			);
			console.log(roomName + " | real Name: " + room.name);
		});
	}

	function selectRoom(roomName: string = "null"): void {
		if(selectedRoom?.state == ConnectionState.Connected) selectedRoom.disconnect();
		selectedRoom = undefined;
		if (roomName == "null") return;
		/*if (Rooms != undefined){
			selectedRoom = Rooms.find(r => r.name === roomName);
		}*/
		if (selectedRoom == undefined){
			selectedRoom = new Room();
		}
		connectToRoom(selectedRoom,roomName);
	}
</script>


<div class="gridContainer">
	<RoomList {selectRoom} {refreshRooms} {Rooms} selectedRoom={selectedRoom?.name}/>
	<div class="stroke">
		{#if selectedRoom !== undefined}
			<RoomItem {selectRoom} {selectedRoom}/>
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