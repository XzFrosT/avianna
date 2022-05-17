require('dotenv').config({
	path: __dirname.substring(0, __dirname.lastIndexOf("/")) + "/.env"
});

import * as express from 'express';
import { InteractionType, InteractionResponseType } from 'discord-interactions';

import { loadCommands } from "./utils/command";
import { verifyDiscordRequest } from "./verify";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
	express.json({
		verify: verifyDiscordRequest(process.env.PUBLIC_KEY)
	})
);

app.post("/interactions", async (req: any, res: any) => {
	if (req.body.type === InteractionType.PING) {
		return res.send({
			type: InteractionResponseType.PONG
		});
		
		console.log("Discord ping received.");
	}
	
	if (req.body.type === InteractionType.APPLICATION_COMMAND) {
		const command = (await import(`./commands/${req.body.data.name}`)).default;
		return command.execute(req, res);
	}
})

app.listen(PORT, () => {
	console.log(`listening at port ${PORT}`);
	loadCommands();
});
