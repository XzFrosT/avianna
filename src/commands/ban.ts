import { REST } from '@discordjs/rest';
import { InteractionResponseType } from 'discord-interactions';
import { Request } from 'express';

import { Command } from "../utils/command";

export default <Command>{
	name: "ban",
	name_localizations: {},
	description: "Ban a member from this server",
	description_localizations: {},
	options: [
		{
			type: 6,
			name: "member",
			name_localizations: {},
			description: "@member or their id to ban",
			description_localizations: {},
			required: true
		},
		{
			type: 3,
			name: "duration",
			name_localizations: {},
			description: "Duration of the ban. the member will be unbanned after the given duration.",
			description_localizations: {},
			required: false
		},
		{
			type: 3,
			name: "reason",
			name_localizations: {},
			description: "Reason of the ban",
			description_localizations: {},
			required: false
		}
	],
	dm_permission: false,
	execute: async (req: Request, DiscordAPI: REST) => {
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "Banned!"
			}
		}
	}
}
