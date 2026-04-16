<script lang="ts">
	import {
		ConnectionState,
		RemoteParticipant,
		RemoteTrack,
		RemoteTrackPublication,
		Room,
		RoomEvent,
		Track
	} from 'livekit-client';
	import { onDestroy, onMount } from 'svelte';

	let { selectedRoom, selectRoom }: { selectedRoom: Room | undefined; selectRoom: (roomName: string) => void } = $props();
	let role: string = $state('Viewer');
	let broadcastState: string = $state('Not live');
	let broadcasterAvailable: boolean = $state(false);
	let broadcasterEnabled: boolean = $state(false);
	let Interval: number | null = null;
	let roomToBroadcastTo: Room | undefined = undefined;
	let screenEl: HTMLDivElement | undefined = $state(undefined);

	let LIVEKIT_URL = 'wss://xrevent-broadcaster-kwyy7b3z.livekit.cloud';
	let livekitBroadcasterToken: string | undefined = undefined;

	function attachTrack(track: Track) {
		if (!screenEl) return;
		const el = track.attach();
		el.setAttribute('data-lk-track', track.sid ?? '');
		if (track.kind === Track.Kind.Video) {
			el.setAttribute('playsinline', 'true');
			el.setAttribute('autoplay', 'true');
		}
		screenEl.appendChild(el);
	}

	function detachTrack(track: Track) {
		track.detach().forEach((el) => el.remove());
	}

	function attachAlreadySubscribedTracks(room: Room) {
		room.remoteParticipants.forEach((participant) => {
			participant.trackPublications.forEach((publication) => {
				if (publication.isSubscribed && publication.track) {
					attachTrack(publication.track);
				}
			});
		});
	}

	async function getBroadcasterToken(name: string, room: string): Promise<string> {
		const response = await fetch('/api/livekitBroadcasterToken?room=' + room, { method: 'GET' });
		return await response.text();
	}

	function connectToRoomAsBroadcaster(room: Room, roomName: string) {
		getBroadcasterToken('Viewer', roomName).then((token) => {
			livekitBroadcasterToken = token;
			room = new Room();
			room?.on(RoomEvent.Connected, () => {
				console.log('Connected <3');
				if (room?.localParticipant?.permissions?.canPublish) {
					console.log('Broadcasting detected: enabling audio and video');
					room?.localParticipant.setMicrophoneEnabled(true);
					room?.localParticipant.setCameraEnabled(true).then((localTrack) => {
						if (localTrack?.videoTrack) attachTrack(localTrack.videoTrack);
					});
				}
			});
			room.connect(LIVEKIT_URL, token).then(() => {
				console.log('Connected as Broadcaster to: ' + room.name);
				selectedRoom = room;
			});
			console.log(roomName + ' | real Name: ' + room.name);
		});
	}

	// Re-run whenever the Room reference or the screen element changes.
	// This is what guarantees subscription for a viewer joining an already-live room:
	// we both register TrackSubscribed AND walk any tracks already subscribed on connect.
	$effect(() => {
		const room = selectedRoom;
		if (!room || !screenEl) return;

		const onTrackSubscribed = (
			track: RemoteTrack,
			publication: RemoteTrackPublication,
			_participant: RemoteParticipant
		) => {
			console.log('TrackSubscribed:', publication.mimeType);
			attachTrack(track);
		};
		const onTrackUnsubscribed = (track: RemoteTrack) => detachTrack(track);
		const onParticipantConnected = (p: RemoteParticipant) => console.log('participantConnected:', p.identity);
		const onParticipantDisconnected = (p: RemoteParticipant) =>
			console.log('participantDisconnected:', p.identity);
		const onDisconnected = (reason: unknown) => console.log('disconnected:', reason);
		const onConnected = () => {
			console.log('Connected <3 as Listener');
			attachAlreadySubscribedTracks(room);
		};

		room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
		room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
		room.on(RoomEvent.ParticipantConnected, onParticipantConnected);
		room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
		room.on(RoomEvent.Disconnected, onDisconnected);
		room.on(RoomEvent.Connected, onConnected);

		// If the room is already connected by the time this effect runs,
		// the Connected event won't fire again — sync up manually.
		if (room.state === ConnectionState.Connected) {
			attachAlreadySubscribedTracks(room);
		}

		return () => {
			room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
			room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
			room.off(RoomEvent.ParticipantConnected, onParticipantConnected);
			room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
			room.off(RoomEvent.Disconnected, onDisconnected);
			room.off(RoomEvent.Connected, onConnected);
		};
	});

	onDestroy(() => {
		selectedRoom?.disconnect();
		if (Interval != null) clearInterval(Interval);
	});

	onMount(() => {
		Interval = setInterval(logMetadata, 1000);
	});
	function logMetadata() {
		console.log(selectedRoom?.state + ' to ' + selectedRoom?.name);
	}

	function becomeBroadcaster() {
		if (selectedRoom === undefined) return;
		if (selectedRoom.numPublishers != 0) return;
		roomToBroadcastTo = selectedRoom;
		selectedRoom.disconnect();
		connectToRoomAsBroadcaster(selectedRoom, selectedRoom.name);
	}

	async function createRTMPLink(room: string): Promise<string> {
		const response = await fetch('/api/livekit-ingest-token?room=' + room, { method: 'GET' });
		console.log(await response.json());
		return response.text();
	}
</script>

<div class="roomView">
	<!-- Main video surface -->
	<section class="roomView__screen panel panel--muted">
		<header class="panel__header">
			<span>{selectedRoom?.name ?? 'Stream'}</span>
			<span class="hstack">
				<span class="indicator-dot" class:indicator-dot--live={(selectedRoom?.numPublishers ?? 0) > 0}></span>
				<span class="eyebrow">{(selectedRoom?.numPublishers ?? 0) > 0 ? 'On Air' : 'Off Air'}</span>
			</span>
		</header>
		<div bind:this={screenEl} class="screen">
			<span class="screen__placeholder eyebrow">No video signal</span>
		</div>
	</section>

	<!-- Right column: participants -->
	<aside class="roomView__participants panel">
		<header class="panel__header">
			<span>Participants</span>
			<span class="badge">{selectedRoom?.numParticipants ?? 0}</span>
		</header>
		<div class="panel__body vstack">
			<p class="eyebrow">Coming soon</p>
		</div>
	</aside>

	<!-- Session / role controls -->
	<section class="roomView__session panel">
		<header class="panel__header"><span>Session</span></header>
		<div class="panel__body vstack">
			<div>
				<p class="eyebrow">Your role</p>
				<h2 class="roomView__role">{role}</h2>
			</div>
			<button
				class="btn btn--danger btn--block"
				onclick={() => {
					selectedRoom?.disconnect();
					selectRoom('null');
				}}
			>
				Leave Room
			</button>
		</div>
	</section>

	<!-- Broadcast controls, with a locked overlay until enabled -->
	<section class="roomView__broadcast panel">
		<header class="panel__header">
			<span>Broadcast</span>
			<span class="badge" class:badge--live={broadcastState !== 'Not live'}>
				{broadcastState}
			</span>
		</header>

		<div class="panel__body broadcast">
			<button class="btn btn--block" disabled={!broadcasterEnabled}>Enable Video</button>
			<button class="btn btn--block" disabled={!broadcasterEnabled}>Enable Audio</button>
			<button class="btn btn--primary btn--block btn--lg broadcast__go" disabled={!broadcasterEnabled}>
				Go Live
			</button>

			{#if !broadcasterEnabled}
				<div class="broadcast__lock">
					<p class="eyebrow">Locked</p>
					<div class="vstack" style="width: min(22rem, 90%);">
						<button class="btn btn--primary btn--block btn--lg" onclick={becomeBroadcaster}>
							Become Broadcaster
						</button>
						<button
							class="btn btn--ghost btn--block"
							onclick={() => selectedRoom && createRTMPLink(selectedRoom.name)}
						>
							Get RTMP Link
						</button>
					</div>
				</div>
			{/if}
		</div>
	</section>

	<!-- Statistics strip -->
	<footer class="roomView__stats panel">
		<div class="stat">
			<span class="eyebrow">Publishers</span>
			<span class="stat__value">{selectedRoom?.numPublishers ?? 0}</span>
		</div>
		<div class="stat">
			<span class="eyebrow">Viewers</span>
			<span class="stat__value">{selectedRoom?.numParticipants ?? 0}</span>
		</div>
		<div class="stat">
			<span class="eyebrow">Room</span>
			<span class="stat__value mono">{selectedRoom?.name ?? '—'}</span>
		</div>
	</footer>
</div>

<style>
	.roomView {
		flex: 1 1 auto;
		display: grid;
		grid-template-columns: 1.3fr 1.3fr 1fr;
		grid-template-rows: minmax(0, 3fr) minmax(0, 1fr) auto;
		grid-template-areas:
			'screen       screen       participants'
			'session      broadcast    participants'
			'stats        stats        stats';
		gap: 1rem;
		padding: 1rem;
		min-height: 0;
	}

	.roomView__screen       { grid-area: screen; display: flex; flex-direction: column; min-height: 0; }
	.roomView__participants { grid-area: participants; display: flex; flex-direction: column; }
	.roomView__session      { grid-area: session; display: flex; flex-direction: column; }
	.roomView__broadcast    { grid-area: broadcast; display: flex; flex-direction: column; position: relative; }
	.roomView__stats        { grid-area: stats; display: flex; gap: 2rem; padding: 0.9rem 1.25rem; }

	.screen {
		flex: 1 1 auto;
		min-height: 0;
		background: #000;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}
	.screen :global(video) {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: block;
	}
	.screen__placeholder { color: var(--fg-subtle); }

	.roomView__role {
		font-family: var(--font-mono);
		font-size: 1.35rem;
		letter-spacing: 0.02em;
	}

	.broadcast {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: auto auto;
		gap: 0.75rem;
		position: relative;
		flex: 1 1 auto;
	}
	.broadcast__go { grid-column: 1 / 3; }

	.broadcast__lock {
		position: absolute;
		inset: 0;
		background: var(--bg-overlay);
		backdrop-filter: blur(2px);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		justify-content: center;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.stat__value {
		font-family: var(--font-mono);
		font-size: 1.15rem;
		font-weight: 600;
	}
</style>
