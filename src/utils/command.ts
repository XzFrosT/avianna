import * as fs from 'fs';

import request from "./request";

const guildId = process.env.GUILD_ID;
const appId = process.env.APP_ID;
const endpoint: string = `/applications/${appId}/guilds/${guildId}/commands`;

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

export const loadCommands = async () => {
	var registeredCommands = await(await request(endpoint + "?with_localizations=true", {
		method: "GET"
	})).json();
	var availableCommands = fs.readdirSync(__dirname.replace("utils", "") + "/commands/").map((file: any) => file.substring(0, file.lastIndexOf(".")));
	
	registeredCommands.forEach((command: any) => {
		if (!availableCommands.includes(command.name)) deleteCommand(command);
	})
	
	fs.readdirSync(__dirname.replace("utils", "") + "/commands/").forEach(async (CommandFile: any) => {
		const command = (await import(`../commands/${CommandFile}`)).default;
		
		if (registeredCommands.length >= 1) {
			const checkExist = registeredCommands.map((command: any) => command.name);
			
			if (checkExist.includes(command.name)) {
				const CurrCommand = registeredCommands.filter((cmd: any) => cmd.name === command.name)[0];
				
				updateCommand(command, CurrCommand);
			} else {
				createCommand(command);
			}
		} else {
			createCommand(command);
		}
	});
}

export const createCommand = (command: CommandInterface) => {
	request(endpoint, {
		method: "POST",
		body: command
	});
	
	console.log(`created ${command.name} command.`);
}

export const deleteCommand = (source: any) => {
	request(endpoint + `/${source.id}`, {
		method: "DELETE"
	});
	
	console.log(`removed ${source.name} command`);
}

export const updateCommand = (command: CommandInterface, source: any) => {
	request(endpoint + `/${source.id}`, {
		method: "PATCH",
		body: command
	});
	
	console.log(`updated ${command.name} command.`);
}
