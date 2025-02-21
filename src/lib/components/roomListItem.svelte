<script lang="ts">
	import {Room} from 'livekit-client';
	let {room,selectRoom,selectedRoom}: {room: Room,selectRoom: (name: string) => void,selectedRoom: string|undefined} = $props();


</script>

<button class="roomListItem" style="background-image: {(selectedRoom===room.name)?'linear-gradient(to bottom right,#111,#444)':'transparent'}" onclick={() => {selectRoom(room.name)}}>
	<h2> {room.name}</h2>
	{#if room.numPublishers>0}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="red" class="bi bi-camera-video"
				 viewBox="0 0 16 16">
			<path fill-rule="evenodd"
						d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556zM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" />
		</svg>
	{:else}
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-video"
				 viewBox="0 0 16 16">
			<path fill-rule="evenodd"
						d="M10.961 12.365a2 2 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l.714 1H9.5a1 1 0 0 1 1 1v6a1 1 0 0 1-.144.518zM1.428 4.18A1 1 0 0 0 1 5v6a1 1 0 0 0 1 1h5.014l.714 1H2a2 2 0 0 1-2-2V5c0-.675.334-1.272.847-1.634zM15 11.73l-3.5-1.555v-4.35L15 4.269zm-4.407 3.56-10-14 .814-.58 10 14z" />
		</svg>
	{/if}
	<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people"
			 viewBox="0 0 16 16">
		<path
			d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
	</svg>
	<p>{room.numParticipants}</p>
</button>

<style>
    .roomListItem {
        width: 100%;
        display: grid;
        grid-template-rows: 2fr 1fr;
        grid-template-columns: 1fr 2em 1em;
        padding: 0.5em 1em;
        border: 1px solid #fff;
        transition: background-color 0.3s, color 0.3s;
    }

    .roomListItem h2 {
        text-align: left;
        font-weight: bold;
        grid-row: 1;
        grid-column: 1/4;
        font-size: 1.2em;
    }

    .roomListItem p {
        text-align: right;
        grid-row: 2;
    }

    .roomListItem .bi-camera-video {
        grid-row: 2;
        height: 1.5em;
        width: 1.5em;

    }

    .roomListItem .bi-people {
        grid-row: 2;
        height: 1.5em;
        width: 1.5em;
    }

    .roomListItem:hover {
        background-color: #444;
    }

    .roomListItem:active {
        background-color: #666;
        color: black;
    }
</style>