require('dotenv').config({
	path: __dirname.substring(0, __dirname.lastIndexOf("/")) + "/.env"
});

import * as express from 'express';
import * as mongoose from 'mongoose';
import { InteractionType, InteractionResponseType } from 'discord-interactions';
import { Request, Response } from 'express';

import { handleCommand, prepareCommands } from "./utils/command";
import { AppPort, DatabaseUri, DiscordAppPublicKey } from "./utils/config";
import { verifyDiscordRequest } from "./verify";

const app = express();

app.use(
	express.json({
		verify: verifyDiscordRequest(DiscordAppPublicKey)
	})
);

mongoose.connect(DatabaseUri).then(() => {
	console.log(`Database connected.`);
});

app.post("/interactions", async (req: Request, res: Response) => {
	if (req.body.type === InteractionType.PING) {
		//prepareCommands();
		
		return res.status(200).send({
			type: InteractionResponseType.PONG
		});
	}
	
	if (req.body.type === InteractionType.APPLICATION_COMMAND) {
		return res.status(200).send(
			await handleCommand(req)
		);
	}
	
	return res.status(404).send({ message: "Rejected." });
});

app.listen(AppPort, () => {
	prepareCommands()
	
	console.log(`Listening at port ${AppPort}`);
});
