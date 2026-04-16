import type { RequestHandler } from './$types';
import { AccessToken} from 'livekit-server-sdk';
import { error } from '@sveltejs/kit';
import { LIVEKIT_URL,LIVEKIT_API_KEY,LIVEKIT_API_SECRET,LIVEKIT_BROADCASTING_USER } from '$env/static/private'

type TokenRequest = {
	roomName: string;
};

export const GET: RequestHandler = async ({ url }) => {

	const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
		identity: LIVEKIT_BROADCASTING_USER,
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
		roomList: false,
		canPublish: true,
		canSubscribeMetrics: true,
	});
	return new Response(await at.toJwt());
};