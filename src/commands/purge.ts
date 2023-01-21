import { REST } from '@discordjs/rest';
import { APIInteractionResponse, APIMessage, APIUser, InteractionResponseType, MessageFlags, Routes } from 'discord-api-types/v10';
import { Request } from 'express';

import { Command } from "../utils/command";
import { parseOptions } from "../utils/functions";

export default <Command>{
	name: "purge",
	name_localizations: {},
	description: "bulk delete messages in the current channel",
	description_localizations: {},
	options: [
		{
			type: 10,
			name: "amount",
			name_localizations: {},
			description: "amount of message(s) to purge (min: 2, max: 100)",
			description_localizations: {},
			required: true,
			min_value: 2,
			max_value: 100
		},
		{
			type: 6,
			name: "member",
			name_localizations: {},
			description: "only purge message from this member",
			description_localizations: {},
			required: false
		}
	],
	default_member_permissions: "0",
	dm_permission: false,
	execute: async (req: Request, DiscordAPI: REST): Promise<APIInteractionResponse> => {
		const ProvidedAmount: number = parseOptions(req, "amount");
		const ProvidedMember = parseOptions(req, "member");
		const currentChannelId = req.body?.channel_id;
		const commandExecutor: APIUser = req.body?.user ?? req.body?.member?.user;
		
		const twoWeeksAgo: number = Date.now() - 12096e5;
		const fetchedMessages: APIMessage[] = await fetchChannelMessages(DiscordAPI, {
			channel_id: currentChannelId,
			query: `limit=100`
		});
		const filteredMessagesAuthor = ProvidedMember ? `by ${ProvidedMember.user.username}#${ProvidedMember.user.discriminator}` : "";
		var filter2WeeksOldMessages: APIMessage[] = fetchedMessages.filter((message: APIMessage) => (new Date(message.timestamp).getTime() > twoWeeksAgo));
		let deletedMessagesCount: number = 0;
		var successMessage = "";
		
		if (fetchedMessages.length < 1 || filter2WeeksOldMessages.length < 1) {
			successMessage = "There's no message for me to purge in this channel, the reason could be this channel is empty or all the messages is older than 2 weeks.";
		} else {
			if (ProvidedMember) {
				var filterAuthorMessages: APIMessage[] = filter2WeeksOldMessages.filter((message: APIMessage) => message.author.id === ProvidedMember.user.id).slice(0, ProvidedAmount);
				deletedMessagesCount = await bulkDeleteMessagesInChannel(DiscordAPI, currentChannelId, filterAuthorMessages.map((message: APIMessage) => message.id))
			} else {
				let firstNThMessages = filter2WeeksOldMessages.slice(0, ProvidedAmount);
				deletedMessagesCount = await bulkDeleteMessagesInChannel(DiscordAPI, currentChannelId, firstNThMessages.map((message: APIMessage) => message.id));
			}
			
			successMessage = `Done! I have deleted **${deletedMessagesCount} messages** ${filteredMessagesAuthor} from this channel.`;
			if (filter2WeeksOldMessages.length < ProvidedAmount) successMessage = `I'm sorry! I can only bulk delete **${deletedMessagesCount} messages** ${filteredMessagesAuthor} out of ${ProvidedAmount} messages you requested due to discord limitations ={`
		}
		
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: successMessage,
				flags: MessageFlags.Ephemeral
			}
		}
	}
}

export const fetchChannelMessages = async (DiscordAPI: REST, options: {
	channel_id: string;
	query?: string;
}): Promise<APIMessage[]> => {
	const { channel_id, query } = options;
	
	try {
		return await DiscordAPI.get(Routes.channelMessages(channel_id), {
			query: new URLSearchParams(query)
		}) as APIMessage[];
	} catch(error: unknown) {
		throw error;
	}
}

export const bulkDeleteMessagesInChannel = async (DiscordAPI: REST, channel_id: string, messages: string[]): Promise<number> => {
	try {
		await DiscordAPI.post(Routes.channelBulkDelete(channel_id), {
			body: {
				messages: messages
			}
		});
		
		return messages.length;
	} catch(error: unknown) {
		throw error;
	}
}
