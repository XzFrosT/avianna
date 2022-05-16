import { verifyKey } from 'discord-interactions';

export const verifyDiscordRequest = (key: string) => {
	return function (req: any, res: any, buf: any, encoding: any) {
		const signature = req.get('X-Signature-Ed25519');
		const timestamp = req.get('X-Signature-Timestamp');
		
		const isValid = verifyKey(req.rawBody, signature, timestamp, key);
		
		if (!isValid) {
			res.status(401).send("Bad request.");
			throw new Error('Bad request signature.');
		}
	}
}
