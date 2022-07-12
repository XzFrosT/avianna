require('dotenv').config({
	path: __dirname.substring(0, __dirname.lastIndexOf("/")) + "/.env"
});

import * as express from 'express';
import * as mongoose from 'mongoose';
import { InteractionType, InteractionResponseType } from 'discord-interactions';

import { handleCommand } from "./utils/command";
import { AppPort, DatabaseUri } from "./utils/config";
import { verifyDiscordRequest } from "./verify";

const app = express();

app.use(
	express.json({
		verify: verifyDiscordRequest(process.env.PUBLIC_KEY)
	})
);

mongoose.connect(DatabaseUri).then(() => {
	console.log(`Database connected.`);
})

app.get("/", (req: any, res: any) => {
	res.send("")
});

app.post("/interactions", async (req: any, res: any) => {
	if (req.body.type === InteractionType.PING) {
		return res.send({
			type: InteractionResponseType.PONG
		});
	}
	
	if (req.body.type === InteractionType.APPLICATION_COMMAND) {
		return res.status(200).send(await handleCommand(req.body));
	}
})

app.listen(AppPort, () => {
	console.log(`Listening at port ${AppPort}`);
});
