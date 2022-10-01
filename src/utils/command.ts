import * as fs from 'fs';
import { REST } from '@discordjs/rest';
import { APIApplicationCommandOption, APIInteractionResponse, InteractionResponseType, MessageFlags, Routes } from 'discord-api-types/v10';
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
	execute?: (req: Request, DiscordAPI: REST) => Promise<APIInteractionResponse>;
}

export default async (req: Request): Promise<APIInteractionResponse> => {
	var command = await import(__dirname.substring(0, __dirname.lastIndexOf("/")) + `/commands/${req.body.data.name}`);
	
	if (!command) return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: `Unknown command.`,
			flags: MessageFlags.Ephemeral
		}
	}
	
	if (fs.existsSync(command) && fs.lstatSync(command).isDirectory()) command = await import(command + `/${req.body.data.name}`);
	
	return await command.default.execute(req, DiscordAPI);
}

export const prepareCommands = async (): Promise<number> => {
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
			} else createApplicationCommand(command);
		} else createApplicationCommand(command);
	});
	
	return 0;
}

export const transformCommand = (command: Command) => {
	const { execute: _, ...transformedCommand } = command;
	
	return transformedCommand;
}

export const getApplicationCommands = async () => {
	return await DiscordAPI.get(Routes.applicationCommands(DiscordAppId));
}

export const createApplicationCommand = async (command: Command) => {
	console.log(`Creating ${command.name} command.`);
	
	try {
		return await DiscordAPI.post(Routes.applicationCommands(DiscordAppId), {
			body: transformCommand(command)
		});
	} catch(error: any) {
		console.error(error);
	}
}

export const deleteApplicationCommand = async (command: any) => {
	console.log(`deleting ${command.name} command.`)
	
	try {
		return await DiscordAPI.delete(Routes.applicationCommand(DiscordAppId, command?.id));
	} catch(error: any) {
		console.error(error);
	}
}

export const editApplicationCommand = async (command: any, updatedCommand: Command) => {
	console.log(`updating ${command.name} command.`)
	
	try {
		return await DiscordAPI.patch(Routes.applicationCommand(DiscordAppId, command?.id), {
			body: transformCommand(updatedCommand)
		});
	} catch(error: any) {
		console.error(error);
	}
}
