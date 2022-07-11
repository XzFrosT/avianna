import * as fs from 'fs';

import { DiscordAPI } from "./discord";

export interface CommandInterface {
	name: string;
	name_localizations?: {
		[key: string]: string;
	};
	description: string;
	description_localizations?: {
		[key: string]: string;
	};
	options: any[];
	execute: any;
}

export const handleCommand = async (interaction: any) => {
	const command = (await import(__dirname.replace("utils") + `./commands/${interaction.data.name}`)).default;
	
	return await command.execute(interaction, DiscordAPI);
}
