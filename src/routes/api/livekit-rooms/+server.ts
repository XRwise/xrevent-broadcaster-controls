import type { RequestHandler } from './$types';
import { RoomServiceClient} from 'livekit-server-sdk';
import { LIVEKIT_URL,LIVEKIT_API_KEY,LIVEKIT_API_SECRET } from '$env/static/private'

type TokenRequest = {
	roomName: string;
	participantName: string;
};
const client = new RoomServiceClient(LIVEKIT_URL,LIVEKIT_API_KEY,LIVEKIT_API_SECRET);

export const GET: RequestHandler = async ({ url }) => {
	return new Response(JSON.stringify(await client.listRooms()));
}