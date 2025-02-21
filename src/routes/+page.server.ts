import { RoomServiceClient } from 'livekit-server-sdk';
import type { PageServerLoad } from './$types';

import { LIVEKIT_URL,LIVEKIT_API_KEY,LIVEKIT_API_SECRET } from '$env/static/private'
const client = new RoomServiceClient(LIVEKIT_URL,LIVEKIT_API_KEY,LIVEKIT_API_SECRET);

export const load: PageServerLoad = async () => {
	let rooms = JSON.stringify(await client.listRooms());
	return {rooms};
	}