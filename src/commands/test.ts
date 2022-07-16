import { REST } from '@discordjs/rest';
import { APIInteractionResponse, InteractionResponseType } from 'discord-api-types/v10';
import { Request } from 'express';

import { Command } from "../utils/command";

export default <Command>{
	name: "test",
	name_localizations: {},
	description: "test command",
	description_localizations: {},
	options: [],
	dm_permission: true,
	execute: async (req: Request, DiscordAPI: REST): Promise<APIInteractionResponse> => {
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "hi :-)"
			}
		}
	}
}
