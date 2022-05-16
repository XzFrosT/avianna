import { InteractionResponseType } from 'discord-interactions';

import { CommandInterface } from "../utils/command";

export default <CommandInterface>{
	name: "test",
	name_localizations: {},
	description: "test command",
	description_localizations: {},
	options: [],
	execute: async (req: any, res: any) => {
		return res.send({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "hi :-)"
			}
		});
	}
}
