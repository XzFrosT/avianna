require('dotenv').config({
	path: __dirname.substring(0, __dirname.lastIndexOf("/")) + "/.env"
});

import * as express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';

import { verifyDiscordRequest } from "./verify";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
	express.json({
		verify: verifyDiscordRequest(process.env.PUBLIC_KEY)
	})
);

app.post("/interactions", async (req: any, res: any) => {
	const interaction = req.body;
	
	if (interaction.type === InteractionType.PING) {
		console.log("received discord ping")
		return res.send({ type: InteractionResponseType.PONG });
	}
	
	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		if (interaction.data.name === "test") {
			return res.send({
				type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
				data: {
					content: "hi <3"
				}
			})
		}
	}
})

app.listen(PORT, () => {
	console.log(`listening at port ${PORT}`);
});
