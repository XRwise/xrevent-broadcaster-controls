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
	import { onDestroy } from 'svelte';
	import type { BroadcastStatus } from '$lib/components/BroadcastControls.svelte';
	import BroadcastControls from '$lib/components/BroadcastControls.svelte';

	let {
		selectedRoom = $bindable(),
		selectRoom
	}: { selectedRoom: Room | undefined; selectRoom: (roomName: string) => void } = $props();

	let broadcastStatus = $state<BroadcastStatus>('idle');
	let screenEl: HTMLDivElement | undefined = $state(undefined);

	let role = $derived(
		broadcastStatus === 'ready' || broadcastStatus === 'live' ? 'Broadcaster' : 'Viewer'
	);

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
		// Fallback: LiveKit's internal element list can be stale; remove by attribute too
		if (track.sid && screenEl) {
			screenEl.querySelectorAll(`[data-lk-track="${track.sid}"]`).forEach((el) => el.remove());
		}
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

	// Re-run whenever the Room reference or the screen element changes.
	// Guarantees subscription for a viewer joining an already-live room:
	// registers TrackSubscribed AND walks tracks already subscribed on connect.
	$effect(() => {
		const room = selectedRoom;
		if (!room || !screenEl) return;

		const onTrackSubscribed = (
			track: RemoteTrack,
			_publication: RemoteTrackPublication,
			_participant: RemoteParticipant
		) => attachTrack(track);
		const onTrackUnsubscribed = (track: RemoteTrack) => detachTrack(track);
		const onConnected = () => attachAlreadySubscribedTracks(room);

		room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
		room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
		room.on(RoomEvent.Connected, onConnected);

		// If already connected when effect runs, Connected won't fire again — sync manually.
		if (room.state === ConnectionState.Connected) {
			attachAlreadySubscribedTracks(room);
		}

		return () => {
			room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
			room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
			room.off(RoomEvent.Connected, onConnected);
			if (screenEl) {
				screenEl.querySelectorAll('[data-lk-track]').forEach((el) => el.remove());
			}
		};
	});

	onDestroy(() => selectedRoom?.disconnect());
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
			<div class="screen__placeholder"><span class="eyebrow">No video signal</span></div>
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

	<!-- Broadcast controls -->
	<div class="roomView__broadcast">
		<BroadcastControls
			bind:selectedRoom
			bind:broadcastStatus
			{selectRoom}
			{attachTrack}
			{detachTrack}
		/>
	</div>

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
		align-items: stretch;
		position: relative;
		overflow: hidden;
	}
	.screen :global(video) {
		flex: 1 1 0;
		min-width: 0;
		min-height: 0;
		max-height: 100%;
		object-fit: contain;
		display: block;
	}
	.screen__placeholder {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--fg-subtle);
		pointer-events: none;
	}
	.screen:has(:global(video)) .screen__placeholder { display: none; }

	.roomView__role {
		font-family: var(--font-mono);
		font-size: 1.35rem;
		letter-spacing: 0.02em;
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
