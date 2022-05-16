require('dotenv').config({
	path: __dirname.substring(0, __dirname.lastIndexOf("/")) + "/.env"
});

import * as express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';

import { verifyDiscordRequest } from "./verify";

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_KEY = process.env.PUBLIC_KEY;

app.use(
	express.json({
		verify: verifyDiscordRequest(PUBLIC_KEY)
	})
);

app.post("/interactions", async (req: any, res: any) => {
	const interaction = req.body;
	
	if (interaction.type === InteractionType.PING) {
		return res.send({ type: InteractionResponseType.PONG });
	}
})

app.listen(PORT, () => {
	console.log(`listening at port ${PORT}`);
});
