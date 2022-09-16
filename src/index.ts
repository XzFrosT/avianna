require('dotenv').config({
	path: __dirname.substring(0, __dirname.lastIndexOf("/")) + "/.env"
});

import * as express from 'express';
import * as mongoose from 'mongoose';
import { InteractionType, InteractionResponseType } from 'discord-api-types/v10';
import { Request, Response } from 'express';

import handleComponents from "./helpers/handlers/components";
import handleCommand, { getApplicationCommands, prepareCommands } from "./utils/command";
import { unbanChecker } from "./helpers/automod";
import { AppPort, DatabaseUri, DiscordAppPublicKey } from "./utils/config";
import { verifyDiscordRequest } from "./verify";

const app = express();

mongoose.connect(DatabaseUri).then(() => console.log("Connected to Database."))
unbanChecker();

app.use(
	express.json({
		verify: verifyDiscordRequest(DiscordAppPublicKey)
	})
);

app.get("/", (req: Request, res: Response) => {
	return res.send("");
})

app.post("/interactions", async (req: Request, res: Response) => {
	if (req.body.type === InteractionType.Ping) {
		return res.status(200).send({
			type: InteractionResponseType.Pong
		});
	} else if (req.body.type === InteractionType.ApplicationCommand) {
		return res.status(200).send(
			await handleCommand(req)
		);
	} else if (req.body.type === InteractionType.MessageComponent) {
		return res.status(200).send(
			await handleComponents(req)
		);
	}
	
	return res.status(404).send({ message: "Rejected." });
});

app.get("/commands/:action", async (req: Request, res: Response) => {
	const { auth } = req?.query;
	const { action } = req?.params;
	
	if (!auth || auth !== process.env.AUTH) return res.status(401).json({
		message: "401: Unauthorized"
	});
	
	if (action === "prepare") {
		prepareCommands();
		
		return res.status(201).json({
			message: "201: All commands has been created and updated"
		});
	} else if (action === "list") {
		return res.status(200).json(
			JSON.parse(
				JSON.stringify((await getApplicationCommands()))
			)
		);
	}
	
	return res.status(404).json({
		message: "404: Not Found"
	})
});

app.listen(AppPort, () => {
	console.log(`Listening at port ${AppPort}`);
});
