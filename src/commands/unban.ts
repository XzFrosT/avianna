import { REST } from '@discordjs/rest';
import { APIBan, APIUser, APIInteractionResponse, InteractionResponseType, MessageFlags, Routes } from 'discord-api-types/v10';
import { Request } from 'express';

import bans from "../schemas/ban";
import colors, { Colors } from "../utils/colors"
import modlog from "../helpers/modlog";
import { getBan } from "./ban";
import { Command } from "../utils/command";
import { getDiscordUser, getUserUrl, makeAvatarUrl, parseOptions } from "../utils/functions";

export default <Command>{
	name: "unban",
	name_localizations: {},
	description: "Unban a banned user",
	description_localizations: {},
	options: [
		{
			type: 3,
			name: "user",
			name_localizations: {},
			description: "username or their id to ban",
			description_localizations: {},
			required: true,
			autocomplete: true
		}
	],
	default_member_permissions: "0",
	dm_permission: false,
	execute: async (req: Request, DiscordAPI: REST): Promise<APIInteractionResponse> => {
		const ProvidedId = parseOptions(req, "user");
		const Moderator = req.body?.user ?? req.body?.member?.user;
		
		const parseUser: APIUser | any = await getDiscordUser(ProvidedId);
		if (!parseUser) return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "Invalid id or user was provided!",
				flags: MessageFlags.Ephemeral
			}
		}
		
		const getUserBan: APIBan | any = await getBan(DiscordAPI, req.body?.guild_id, parseUser.id)
		if (!getUserBan) return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "That user wasn't banned.",
				flags: MessageFlags.Ephemeral
			}
		}
		
		await bans.findOneAndDelete({ 'user.id': parseUser.id });
		await DiscordAPI.delete(Routes.guildBan(req.body?.guild_id, parseUser.id));
		
		modlog(DiscordAPI, {
			action: "unban",
			user: parseUser,
			moderator: Moderator,
			reason: null,
			channel: null,
			message: null,
			duration: null
		});
		
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				embeds: [
					{
						color: colors(Colors["BLACK.Ban"]),
						author: {
							name: `${parseUser?.username}#${parseUser?.discriminator} is now unbanned`,
							url: getUserUrl(parseUser),
							icon_url: makeAvatarUrl(parseUser)
						}
					}
				]
			}
		}
	}
}
