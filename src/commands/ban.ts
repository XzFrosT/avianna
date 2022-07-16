import parseDuration from 'parse-duration';
import { REST, RequestData } from '@discordjs/rest';
import { APIBan, APIEmbed, APIInteractionResponse, ButtonStyle, ComponentType, InteractionResponseType, Routes, Snowflake } from 'discord-api-types/v10';
import { Request } from 'express';

import bans from "../schemas/ban";
import modlog from "../helpers/modlog";
import colors, { Colors } from "../utils/colors";
import { Command } from "../utils/command";
import { forHumans, getUserUrl, makeAvatarUrl, parseOptions } from "../utils/functions";

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
	execute: async (req: Request, DiscordAPI: REST): Promise<APIInteractionResponse> => {
		const ProvidedUser: any = parseOptions(req, "member");
		const ProvidedDuration = parseOptions(req, "duration");
		const ProvidedReason = parseOptions(req, "reason");
		const Moderator = req.body?.user ?? req.body?.member?.user;
		
		const CheckBanStatus = await getBan(DiscordAPI, req?.body?.guild_id, ProvidedUser?.user?.id);
		
		if (CheckBanStatus) {
			var AlreadyBannedMessage: string = `**${ProvidedUser?.user?.username}#${ProvidedUser?.user?.discriminator}** is already banned from this server.`;
			if (CheckBanStatus.reason) AlreadyBannedMessage += ` With reason ${CheckBanStatus.reason}`;
			
			return {
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: AlreadyBannedMessage
				}
			}
		}
		
		var metadata: RequestData = {}
		let BanEmbedAuthor = `${ProvidedUser.user.username}#${ProvidedUser.user.discriminator} has been banned`;
		let DurationInMs: number | null = null;
		
		if (ProvidedReason) metadata.headers = {
			'X-Audit-Log-Reason': ProvidedReason
		}
		
		if (ProvidedDuration) {
			DurationInMs = parseDuration(ProvidedDuration);
			
			if (DurationInMs >= 1000) {
				var time = forHumans(DurationInMs);
				
				BanEmbedAuthor += ` for ${time}`;
				
				new bans({
					unban_at: Number(Date.now()) + Number(DurationInMs),
					guild_id: req?.body?.guild_id,
					user: ProvidedUser.user
				}).save();
			}
		}
		
		//await DiscordAPI.put(Routes.guildBan(req?.body?.guild_id, ProvidedUser?.user?.id), metadata);
		
		var BanEmbed: APIEmbed = {
			description: `**Reason:** ${ProvidedReason ?? "Unspecified"}`,
			color: colors(Colors["BLACK.Ban"]),
			author: {
				name: `${BanEmbedAuthor}`,
				url: getUserUrl(ProvidedUser.user),
				icon_url: makeAvatarUrl(ProvidedUser.user)
			}
		}
		
		if (DurationInMs) Object.defineProperties(BanEmbed, {
			timestamp: {
				enumerable: true,
				value: new Date(Date.now() + DurationInMs).toISOString(),
			},
			footer: {
				enumerable: true,
				value: {
					text: "Banned until"
				}
			}
		});
		
		await modlog(DiscordAPI, {
			action: "ban",
			user: ProvidedUser.user,
			moderator: Moderator,
			reason: ProvidedReason ?? "Unspecified",
			channel: null,
			message: null,
			duration: DurationInMs ?? "∞"
		});
		
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				embeds: [BanEmbed],
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								style: ButtonStyle.Danger,
								label: "Unban",
								custom_id: `unban_${ProvidedUser?.user?.id}@${req?.body?.guild_id}`
							}
						]
					}
				]
			}
		}
	}
}

export const getBan = async (DiscordAPI: REST, guildId: Snowflake, userId: Snowflake): Promise<APIBan | any> => {
	try {
		return await DiscordAPI.get(Routes.guildBan(guildId, userId));
	} catch(error) {
		return null;
	}
}
