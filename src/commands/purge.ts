import { REST } from '@discordjs/rest';
import { APIInteractionResponse, APIMessage, APIUser, InteractionResponseType, MessageFlags, PermissionFlagsBits, Routes } from 'discord-api-types/v10';
import { Request } from 'express';

import { Command } from "../utils/command";
import { DiscordAppId } from "../utils/config";
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
	default_member_permissions: String(PermissionFlagsBits.ManageChannels),
	dm_permission: false,
	execute: async (req: Request, DiscordAPI: REST): Promise<APIInteractionResponse> => {
		performPurge(req, DiscordAPI)
		
		return {
			type: InteractionResponseType.DeferredChannelMessageWithSource,
			data: {
				flags: MessageFlags.Ephemeral
			}
		}
	}
}

async function performPurge(req: Request, DiscordAPI: REST): Promise<void> {
	const ProvidedAmount: number = parseOptions(req, "amount");
	const ProvidedMember = parseOptions(req, "member");
	const currentChannelId = req.body?.channel_id;
	const commandExecutor: APIUser = req.body?.user ?? req.body?.member?.user;
	
	var fetchedMessages: APIMessage[] = [];
	while (true) {
		if (fetchedMessages.length < ProvidedAmount || ProvidedMember && fetchedMessages.filter((v: APIMessage) => v?.author.id === ProvidedMember?.user.id).length < ProvidedAmount) {
			var oldestMessageFetched = fetchedMessages.sort((a: APIMessage, b: APIMessage) => { return +new Date(a.timestamp) - +new Date(b.timestamp) });
			const currFetched = await fetchChannelMessages(DiscordAPI, {
				channel_id: currentChannelId,
				query: `limit=${ProvidedMember? 100: ProvidedAmount}${oldestMessageFetched[0]? `&before=${oldestMessageFetched[0].id}`: ""}`
			});
			
			fetchedMessages.push(...currFetched);
		} else break;
	}
	
	fetchedMessages = fetchedMessages.filter((v: APIMessage, i: number, a: APIMessage[]) => a.indexOf(v) === i);
	let deletedMessagesCount: number = 0;
	let successMessage = "";
	var sentBy = ProvidedMember? `sent by ${ProvidedMember?.user.username}#${ProvidedMember?.user.discriminator}`: "";
	var twoWeeksAgo: number = Date.now() - 12096e5;
	var filter2WeeksOldMessages: APIMessage[] = fetchedMessages.filter((v: APIMessage) => (new Date(v.timestamp).getTime() > twoWeeksAgo));
	
	if (ProvidedMember) filter2WeeksOldMessages = filter2WeeksOldMessages.filter((v: APIMessage) => v?.author.id === ProvidedMember?.user.id);
	if (fetchedMessages.length < 1 || filter2WeeksOldMessages.length < 1) {
		successMessage = "There's no message for me to purge in this channel, the reason could be this channel is empty or all the messages is older than 2 weeks.";
	} else {
		deletedMessagesCount += await bulkDeleteMessagesInChannel(DiscordAPI, currentChannelId, filter2WeeksOldMessages.slice(0, ProvidedAmount).map((v: APIMessage) => v.id));
		
		if (deletedMessagesCount < ProvidedAmount) successMessage = `I'm sorry! I can only bulk delete **${deletedMessagesCount} messages** ${sentBy} out of ${ProvidedAmount} messages you requested due to discord limitations ={`;
		else successMessage = `Done! I have deleted **${deletedMessagesCount} messages** ${sentBy} from this channel.`;
	}
	
	DiscordAPI.patch(Routes.webhookMessage(DiscordAppId, req.body?.token), {
		body: {
			content: successMessage,
			flags: MessageFlags.Ephemeral
		}
	});
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