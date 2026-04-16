import { IngressClient, IngressInput } from 'livekit-server-sdk';
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_BROADCASTING_USER, LIVEKIT_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

const ingressClient = new IngressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

export const GET: RequestHandler = async ({ url }) => {

	const ingress = {
		name: 'my-ingress',
		roomName: url.searchParams.get('room')??"Testing123",
		participantIdentity: LIVEKIT_BROADCASTING_USER,
		participantName: 'WHIP STREAMER',
		// Transcode the input stream. Can only be false for WHIP.
		enableTranscoding: false
	};
	console.log(url.searchParams.get('room'));
	const ingressData = await ingressClient.createIngress(IngressInput.WHIP_INPUT,ingress);
	return new Response(JSON.stringify(ingressData));
};
