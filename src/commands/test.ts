import { REST } from '@discordjs/rest';
import { InteractionResponseType } from 'discord-interactions';
import { Request } from 'express';

import { Command } from "../utils/command";

export default <Command>{
	name: "test",
	name_localizations: {},
	description: "test command",
	description_localizations: {},
	options: [],
	dm_permission: true,
	execute: async (req: Request, DiscordAPI: REST) => {
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "hi :-)"
			}
		}
	}
}
