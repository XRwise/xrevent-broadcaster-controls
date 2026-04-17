<script lang="ts">
	import { LocalAudioTrack, LocalVideoTrack, Room, RoomEvent, Track } from 'livekit-client';

	export type BroadcastStatus = 'idle' | 'connecting' | 'ready' | 'live';

	let {
		selectedRoom = $bindable(),
		broadcastStatus = $bindable(),
		selectRoom,
		attachTrack,
		detachTrack
	}: {
		selectedRoom: Room | undefined;
		broadcastStatus: BroadcastStatus;
		selectRoom: (roomName: string) => void;
		attachTrack: (track: Track) => void;
		detachTrack: (track: Track) => void;
	} = $props();

	// TODO: move to PUBLIC_LIVEKIT_URL env var ($env/static/public)
	const LIVEKIT_URL = 'wss://xrevent-broadcaster-kwyy7b3z.livekit.cloud';

	let localCameraTrack = $state<LocalVideoTrack | undefined>(undefined);
	let localScreenTrack = $state<LocalVideoTrack | undefined>(undefined);
	let micOn = $state(false);
	let includeSystemAudio = $state(false);
	let localSystemAudioTrack = $state<LocalAudioTrack | undefined>(undefined);

	let anyTrackActive = $derived(!!localCameraTrack || !!localScreenTrack || micOn);

	$effect(() => {
		if (broadcastStatus === 'ready' || broadcastStatus === 'live') {
			broadcastStatus = anyTrackActive ? 'live' : 'ready';
		}
	});

	let broadcastStateLabel = $derived(
		broadcastStatus === 'live'
			? 'Live'
			: broadcastStatus === 'ready'
				? 'Ready'
				: broadcastStatus === 'connecting'
					? 'Connecting…'
					: 'Not live'
	);

	function resetLocalState(roomName: string) {
		localCameraTrack = undefined;
		localScreenTrack = undefined;
		localSystemAudioTrack = undefined;
		micOn = false;
		broadcastStatus = 'idle';
		selectRoom(roomName);
	}

	async function getBroadcasterToken(room: string): Promise<string> {
		const res = await fetch('/api/livekitBroadcasterToken?room=' + room);
		return res.text();
	}

	async function connectToRoomAsBroadcaster(previousRoom: Room, roomName: string) {
		try {
			const token = await getBroadcasterToken(roomName);
			await previousRoom.disconnect();

			const broadcasterRoom = new Room();
			broadcasterRoom.on(RoomEvent.Connected, () => {
				selectedRoom = broadcasterRoom;
				broadcastStatus = 'ready';
			});
			broadcasterRoom.on(RoomEvent.Disconnected, () => {
				if (broadcastStatus !== 'idle') resetLocalState(roomName);
			});

			await broadcasterRoom.connect(LIVEKIT_URL, token);
		} catch (err) {
			console.error('Broadcaster connection failed', err);
			broadcastStatus = 'idle';
		}
	}

	async function toggleCamera() {
		if (!selectedRoom) return;
		if (localCameraTrack) {
			detachTrack(localCameraTrack);
			await selectedRoom.localParticipant.unpublishTrack(localCameraTrack);
			localCameraTrack.stop();
			localCameraTrack = undefined;
		} else {
			const pub = await selectedRoom.localParticipant.setCameraEnabled(true);
			if (pub?.videoTrack) {
				localCameraTrack = pub.videoTrack;
				attachTrack(pub.videoTrack);
			}
		}
	}

	async function toggleMic() {
		if (!selectedRoom) return;
		const next = !micOn;
		await selectedRoom.localParticipant.setMicrophoneEnabled(next);
		micOn = next;
	}

	async function toggleScreenshare() {
		if (!selectedRoom) return;
		if (localScreenTrack) {
			detachTrack(localScreenTrack);
			if (localSystemAudioTrack) {
				await selectedRoom.localParticipant.unpublishTrack(localSystemAudioTrack);
				localSystemAudioTrack = undefined;
			}
			await selectedRoom.localParticipant.setScreenShareEnabled(false);
			localScreenTrack = undefined;
		} else {
			const tracks = await selectedRoom.localParticipant.createScreenTracks({
				audio: includeSystemAudio
			});
			for (const track of tracks) {
				await selectedRoom.localParticipant.publishTrack(track);
				if (track.kind === Track.Kind.Video) {
					localScreenTrack = track as LocalVideoTrack;
					attachTrack(track);
				} else if (track.kind === Track.Kind.Audio) {
					localSystemAudioTrack = track as LocalAudioTrack;
				}
			}
		}
	}

	function stopBroadcasting() {
		if (!selectedRoom) return;
		const name = selectedRoom.name;
		selectedRoom.localParticipant.setCameraEnabled(false);
		selectedRoom.localParticipant.setMicrophoneEnabled(false);
		selectedRoom.localParticipant.setScreenShareEnabled(false);
		resetLocalState(name);
	}

	function becomeBroadcaster() {
		if (!selectedRoom) return;
		if (selectedRoom.numPublishers > 0) {
			if (!confirm('Someone is already broadcasting. Take over?')) return;
		}
		broadcastStatus = 'connecting';
		connectToRoomAsBroadcaster(selectedRoom, selectedRoom.name);
	}

	async function getIngestInfo() {
		if (!selectedRoom) return;
		const res = await fetch('/api/livekit-ingest-token?room=' + selectedRoom.name);
		console.log(await res.json());
	}
</script>

<section class="bc panel">
	<header class="panel__header">
		<span>Broadcast</span>
		<span
			class="badge"
			class:badge--live={broadcastStatus === 'live'}
			class:badge--pending={broadcastStatus === 'connecting' || broadcastStatus === 'ready'}
		>
			{broadcastStateLabel}
		</span>
	</header>

	<div class="panel__body vstack">
		{#if broadcastStatus === 'idle'}
			<button class="btn btn--primary btn--block btn--lg" onclick={becomeBroadcaster}>
				Become Broadcaster
			</button>
			<button class="btn btn--ghost btn--block" onclick={getIngestInfo}>
				Get RTMP Link
			</button>
		{:else if broadcastStatus === 'connecting'}
			<button class="btn btn--primary btn--block btn--lg" disabled>Connecting…</button>
		{:else}
			<div class="source-row">
				<span class="eyebrow">Video</span>
				<button
					class="btn btn--block source-btn"
					class:btn--primary={!!localCameraTrack}
					class:btn--ghost={!localCameraTrack}
					onclick={toggleCamera}
				>Camera</button>
				<button
					class="btn btn--block source-btn"
					class:btn--primary={!!localScreenTrack}
					class:btn--ghost={!localScreenTrack}
					onclick={toggleScreenshare}
				>Screen</button>
			</div>
			<div class="source-row">
				<span class="eyebrow">Audio</span>
				<button
					class="btn btn--block source-btn"
					class:btn--primary={micOn}
					class:btn--ghost={!micOn}
					onclick={toggleMic}
				>Mic</button>
				<div></div>
			</div>
			<label class="sys-audio-toggle" class:sys-audio-toggle--on={includeSystemAudio}>
				<input type="checkbox" bind:checked={includeSystemAudio} disabled={!!localScreenTrack} />
				<span class="sys-audio-toggle__box" aria-hidden="true"></span>
				<span class="sys-audio-toggle__label">Include system audio in screenshare</span>
			</label>
			<button class="btn btn--danger btn--block" onclick={stopBroadcasting}>
				{broadcastStatus === 'ready' ? 'Cancel' : 'Stop Broadcasting'}
			</button>
		{/if}
	</div>
</section>

<style>
	.bc {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		min-height: 0;
	}

	.bc :global(.panel__body) {
		flex: 1 1 auto;
		min-height: 0;
		overflow: auto;
		padding: 0.625rem 0.75rem;
		gap: 0.4rem;
	}

	.source-row {
		display: grid;
		grid-template-columns: 2.75rem 1fr 1fr;
		gap: 0.375rem;
		align-items: center;
	}
	.source-row .eyebrow {
		font-size: 0.5625rem;
	}

	.source-btn {
		padding: 0.25rem 0.375rem;
		min-height: 1.75rem;
		font-size: 0.625rem;
	}

	.sys-audio-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		border: 1px solid var(--border-muted);
		cursor: pointer;
		transition: border-color var(--t-fast);
	}
	.sys-audio-toggle:has(input:disabled) {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.sys-audio-toggle--on {
		border-color: var(--fg);
	}
	.sys-audio-toggle input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}
	.sys-audio-toggle__box {
		flex-shrink: 0;
		width: 0.875rem;
		height: 0.875rem;
		border: 1px solid var(--border-muted);
		background: transparent;
		position: relative;
		transition: background var(--t-fast), border-color var(--t-fast);
	}
	.sys-audio-toggle--on .sys-audio-toggle__box {
		background: var(--fg);
		border-color: var(--fg);
	}
	.sys-audio-toggle--on .sys-audio-toggle__box::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--bg);
		clip-path: polygon(15% 50%, 38% 72%, 85% 20%, 92% 28%, 38% 85%, 8% 58%);
	}
	.sys-audio-toggle__label {
		font-family: var(--font-mono);
		font-size: 0.5625rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--fg-muted);
		line-height: 1.3;
	}
	.sys-audio-toggle--on .sys-audio-toggle__label {
		color: var(--fg);
	}
</style>
