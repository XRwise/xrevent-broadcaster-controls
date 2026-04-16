<script lang="ts">
	import { RemoteParticipant, RemoteTrack, RemoteTrackPublication, Room, RoomEvent } from 'livekit-client';
	import { onDestroy, onMount } from 'svelte';

	let {selectedRoom, selectRoom}:{selectedRoom:Room|undefined, selectRoom:(roomName: string)=>void} = $props();
	let state: string = $state("Viewer");
	let broadcastState: string = $state("Not live");
	let broadcasterAvailable: boolean = $state(false);
	let broadcasterEnabled: boolean = $state(false);
	let Interval : number|null = null;
	let roomToBroadcastTo: Room | undefined = undefined;

	let LIVEKIT_URL="wss://xrevent-broadcaster-kwyy7b3z.livekit.cloud"
	let livekitBroadcasterToken: string | undefined = undefined;

	//ask the Sveltekit Server for a token
	async function getBroadcasterToken(name: string, room: string): Promise<string>{
		const response = await fetch('/api/livekitBroadcasterToken?room=' + room, {
			method: 'GET'
		});
		return await response.text();
	}

	function connectToRoomAsBroadcaster(room: Room, roomName:string){
		getBroadcasterToken('Viewer',roomName).then(token => {
			livekitBroadcasterToken = token;
			room = new Room();
			room?.on(RoomEvent.Connected,() => {
				console.log("Connected <3")
				if (room?.localParticipant?.permissions?.canPublish){
					console.log("Broadcasting deteted: Enabeling Audio and Video")
					room?.localParticipant.setMicrophoneEnabled(true)
					room?.localParticipant.setCameraEnabled(true).then((localTrack) =>{
						const element = localTrack?.videoTrack?.attach();
						document.getElementById("screen")?.appendChild(element);
					});
				}
			})
			room.on(RoomEvent.TrackSubscribed,handleTrackSubscribed)
			function handleTrackSubscribed(
				track: RemoteTrack,
				publication: RemoteTrackPublication,
				participant: RemoteParticipant,
			) {
				// Attach track to a new HTMLVideoElement or HTMLAudioElement
				console.log(publication.mimeType);
				const element = track.attach();
				document.getElementById("screen")?.appendChild(element);
			}
			room.connect(LIVEKIT_URL,token).then(() =>{
					console.log("Connected as Broadcaster to: " + room.name);
					console.log("State: " +  room.state);
					selectedRoom = room;
				}
			);
			console.log(roomName + " | real Name: " + room.name);
		});
	}

	selectedRoom?.on(RoomEvent.ParticipantConnected||RoomEvent.ParticipantDisconnected,(participant) =>{
		console.log("participant Changed: " + participant);
	});
	selectedRoom?.on(RoomEvent.Disconnected,(reason)=>{
		console.log(reason);
		//selectRoom("null");
	});
	selectedRoom?.on(RoomEvent.TrackSubscribed,handleTrackSubscribed)
	function handleTrackSubscribed(
		track: RemoteTrack,
		publication: RemoteTrackPublication,
		participant: RemoteParticipant,
	) {
		// Attach track to a new HTMLVideoElement or HTMLAudioElement
		console.log(publication.mimeType);
		const element = track.attach();
		document.getElementById("screen")?.appendChild(element);
	}

	selectedRoom?.on(RoomEvent.Connected,() => {
		console.log("Connected <3 as Listener")
	})
	onDestroy(() => {
		selectedRoom?.disconnect();
		if (Interval !=null) clearInterval(Interval);
	});

	onMount(() =>{
		Interval=setInterval(logMetadata,1000);

	})
	function logMetadata(){
		console.log(selectedRoom?.state + " to " + selectedRoom?.name)
	}

	function becomeBroadcaster(){
		if (selectedRoom === undefined) return;
		//check if possible
		if (selectedRoom.numPublishers != 0) return;
		roomToBroadcastTo = selectedRoom;
		selectedRoom.disconnect();
		connectToRoomAsBroadcaster(selectedRoom,selectedRoom.name);
	}

	async function createRTMPLink(room: string): Promise<string> {
		const response = await fetch('/api/livekit-ingest-token?room=' + room, {
			method: 'GET'
		});
		console.log(await response.json());
		return response.text();
	}

</script>


<div class="gridContainer">
	<div id="screen" class="screen">Video</div>
	<div class="stroke participantList" >Participants</div>
	<div class="stroke controls" >
			<p>You are a:</p>
			<h2>{state}</h2>
			<button onclick={()=>{selectedRoom?.disconnect();selectRoom("null");}}>Leave Room</button>
	</div>
	<div class="stroke broadcasterControls">
		<button style="grid-column: 1; grid-row: 2">Enable Video</button>
		<button style="grid-column: 1; grid-row: 3">Enable Audio</button>
		<p style="grid-column: 2; grid-row: 1">You are a:</p>
		<h2 style="grid-column: 2; grid-row: 2">{broadcastState}</h2>
		<button style="grid-column: 2; grid-row: 3">GoLive</button>
		{#if !broadcasterEnabled}
		<div style="grid-column: 1/3; grid-row: 1/4; background-color: #444444c3; width: 100%; height: 100%;display: grid;justify-items: center;align-items: center">
			<button onclick={becomeBroadcaster}>Become Broadcaster</button>
			<button onclick={createRTMPLink(selectedRoom.name)}>Get RTMP</button>
		</div>
		{/if}
	</div>

	<div class="stroke statistics">statistics: <br> Publishers: {selectedRoom?.numPublishers} <br> Viewers: {selectedRoom?.numParticipants}</div>
</div>

<style>
	.gridContainer {
			display: grid;
			grid-template-columns: 1.3fr 1.3fr 1.3fr 1fr;
			grid-template-rows: 3fr 1fr 1fr;
			height: 100%;
			grid-column-gap: 1em;
			grid-row-gap: 1em;
			padding: 1em;
	}
	.stroke {
      padding: 1em;
      border: 1px solid #fff;
      height: 100%;
      color: white;
	}
	.screen{
			background-color: black;
			grid-column: 1/4;
			grid-row:1;
      height: 100%;
      color: white;
	}
	.participantList{
		grid-column: 4;
			grid-row: 1/4;
	}
	.controls{
			grid-column: 1;
			grid-row: 2;
			display: grid;
			grid-template-rows: 1fr 1fr 2fr;
			align-items: center;
			justify-items: center;
	}
	.controls p {
			grid-row: 1;
	}
	.controls h2{
			font-size: 1.5em;
			font-weight: 600;
			grid-row: 2;
	}
  .controls button{
			width: 90%;
      background-color: grey;
			border-radius: 1em;
      grid-column: 1;
      grid-row: 3;
			padding: 1em;
  }
  .broadcasterControls {
      grid-column: 2/4;
			display: grid;
			justify-items: center;
			align-items: center;
  }
  .broadcasterControls button{
      width: 90%;
			height: 4em;
      background-color: grey;
      border-radius: 1em;
      padding: 1em;
  }

	.statistics {
			grid-column: 1/4;
			grid-row: 3;
	}

</style>