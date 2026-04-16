import type { RequestHandler } from './$types';
import { AccessToken} from 'livekit-server-sdk';
import { error } from '@sveltejs/kit';
import { LIVEKIT_URL,LIVEKIT_API_KEY,LIVEKIT_API_SECRET } from '$env/static/private'



type TokenRequest = {
	roomName: string;
	participantName: string;
};

export const GET: RequestHandler = async ({ url }) => {

	const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
		identity:  url.searchParams.get('participantName')??undefined,
		// Token to expire after 10 minutes
		ttl: '10m',
	});
	// Token permissions can be added here based on the
	// desired capabilities of the participant
	if (url.searchParams.get('room') == null) error(404,"No room passed");
	at.addGrant({
		room: url.searchParams.get('room')??undefined,
		roomJoin: true,
		canUpdateOwnMetadata: true,
		canSubscribe: true,
		roomList: true,
		canPublish: false,
		canSubscribeMetrics: true,
	});
	return new Response(await at.toJwt());
};