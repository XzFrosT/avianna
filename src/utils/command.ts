import * as fs from 'fs';
import { REST } from '@discordjs/rest';
import { APIApplicationCommandOption, Routes } from 'discord-api-types/v10';
import { InteractionResponseType } from 'discord-interactions';
import { Request } from 'express';

import { DiscordAppId } from "./config";
import { DiscordAPI } from "./discord";

export interface Command {
	name: string;
	name_localizations?: {
		[key: string]: string;
	};
	description: string;
	description_localizations?: {
		[key: string]: string;
	};
	options?: APIApplicationCommandOption[];
	default_member_permissions?: string;
	dm_permission?: boolean;
	type?: any;
	execute?: (req: Request, DiscordAPI: REST) => Promise<any>;
}

export const handleCommand = async (req: Request) => {
	const command = await import(__dirname.substring(0, __dirname.lastIndexOf("/")) + `/commands/${req.body.data.name}`);
	
	if (!command) return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `Unknown command.`,
			ephemeral: true
		}
	}
	
	return await command.default.execute(req, DiscordAPI);
}

export const prepareCommands = async () => {
	const ExistingCommands: any = await getApplicationCommands();
	const AvailableCommands = fs.readdirSync(__dirname.substring(0, __dirname.lastIndexOf("/")) + "/commands/")
	.map((CommandFile: string) => CommandFile.substring(0, CommandFile.lastIndexOf(".")));
	
	fs.readdirSync(__dirname.substring(0, __dirname.lastIndexOf("/")) + "/commands/").forEach(async (CommandFile: string) => {
		const command = (await import(__dirname.substring(0, __dirname.lastIndexOf("/")) + `/commands/${CommandFile}`)).default;
		
		if (ExistingCommands.length >= 1) {
			const MappedExistingCommands = ExistingCommands.map((ACommand: any) => ACommand.name);
			
			if (MappedExistingCommands.includes(command.name)) {
				const MatchedCommand = ExistingCommands.filter((ACommand: any) => ACommand.name === command.name)[0];
				
				editApplicationCommand(MatchedCommand, command);
			}
		} else createApplicationCommand(command);
	});
	
	return 0;
}

export const transformCommand = (command: Command) => {
	return {
		name: command.name,
		name_localizations: command.name_localizations,
		description: command.description,
		description_localizations: command.description_localizations,
		options: command.options,
		dm_permission: command.dm_permission
	}
}

export const getApplicationCommands = async () => {
	return await DiscordAPI.get(Routes.applicationCommands(DiscordAppId));
}

export const createApplicationCommand = async (command: Command) => {
	return await DiscordAPI.post(Routes.applicationCommands(DiscordAppId), {
		body: transformCommand(command)
	});
}

export const editApplicationCommand = async (command: any, updatedCommand: Command) => {
	return await DiscordAPI.patch(Routes.applicationCommand(DiscordAppId, command?.id), {
		body: transformCommand(updatedCommand)
	});
}

