import { REST } from '@discordjs/rest';
import { APIInteractionResponse, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { Request } from 'express';

import { Command } from "../utils/command";
import { getDiscordUser } from "../utils/functions";
import blacklist from "../schemas/blacklist";

interface CommandDataOption {
	name: string;
	type: number;
	value?: string | number;
	options?: CommandDataOption[];
	focused?: boolean;
}

export default <Command>{
	name: "chat",
	name_localizations: {},
	description: "Chat Bot helpers and utility commands",
	description_localizations: {},
	options: [ 
		{
			type: 2,
			name: "blacklist",
			name_localizations: {},
			description: "chatbot blacklist manager",
			description_localizations: {},
			options: [
				{
					type: 1,
					name: "add",
					name_localizations: {},
					description: "add user or guild to blacklist",
					description_localizations: {},
					options: [
						{
							type: 3,
							name: "type",
							name_localizations: {},
							description: "is the victim a guild or user",
							description_localizations: {},
							required: true,
							choices: [
								{
									name: "guild",
									name_localizations: {},
									value: "guild"
								},
								{
									name: "user",
									name_localizations: {},
									value: "user"
								}
							]
						},
						{
							type: 3,
							name: "victim",
							name_localizations: {},
							description: "the id of user/guild to blacklist",
							description_localizations: {},
							required: true
						}
					]
				},
				{
					type: 1,
					name: "remove",
					name_localizations: {},
					description: "remove user or guild from blacklist",
					description_localizations: {},
					options: [
						{
							type: 3,
							name: "victim",
							name_localizations: {},
							description: "the id of user/guild to unblacklist",
							description_localizations: {},
							required: true
						}
					]
				}
			]
		}
	],
	default_member_permissions: "0",
	dm_permission: false,
	execute: async (req: Request, DiscordAPI: REST): Promise<APIInteractionResponse> => {
		const SubCommand = req?.body?.data?.options[0];
		
		if (SubCommand.name === "blacklist") return await BlacklistCommand(req, SubCommand);
		
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "hey!"
			}
		}
	}
}

export const BlacklistCommand = async (req: Request, SubCommand: CommandDataOption): Promise<APIInteractionResponse> => {
	const SubCommandAction = SubCommand?.options?.[0];
	var payload = {
		flags: MessageFlags.Ephemeral
	};
	
	if (SubCommandAction?.name === "add") {
		const banIt = await BlacklistAddCommand(SubCommandAction);
		
		if (banIt === 0) Object.defineProperty(payload, "content", {
			enumerable: true,
			value: "already being blacklisted."
		});
		else if (banIt === 1) Object.defineProperty(payload, "content", {
			enumerable: true,
			value: "added to blacklist."
		});
	} else if (SubCommandAction?.name === "remove") {
		const unblacklistIt = await BlacklistRemoveCommand(SubCommandAction);
		
		if (unblacklistIt === 0) Object.defineProperty(payload, "content", {
			enumerable: true,
			value: "was not being blacklisted."
		});
		else if (unblacklistIt === 1) Object.defineProperty(payload, "content", {
			enumerable: true,
			value: "removed from blacklist."
		});
	}
	
	return {
		type: InteractionResponseType.ChannelMessageWithSource,
		data: payload
	}
}

async function BlacklistAddCommand(command: any): Promise<number> {
	const ProvidedUser = command?.options?.filter((ops: any) => ops.name === "victim")[0].value;
	const ProvidedType = command?.options?.filter((ops: any) => ops.name === "type")[0].value;
	
	const getUserBlacklist = await blacklist.findOne({ id: ProvidedUser });
	
	if (getUserBlacklist) return 0;
	
	new blacklist({
		id: ProvidedUser,
		type: String(ProvidedType).toUpperCase()
	}).save();
	
	return 1;
}

async function BlacklistRemoveCommand(command: any): Promise<number> {
	const ProvidedUser = command?.options?.filter((ops: any) => ops.name === "victim")[0].value;
	
	const getUserBlacklist = await blacklist.findOne({ id: ProvidedUser });
	
	if (!getUserBlacklist) return 0;
	
	await blacklist.deleteOne({ id: ProvidedUser });
	
	return 1;
}
