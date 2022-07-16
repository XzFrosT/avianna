import { APIBan, ComponentType, MessageFlags, InteractionResponseType, Routes, Snowflake } from 'discord-api-types/v10';
import { Request, Response } from 'express';

import colors, { Colors } from "../../utils/colors";
import { DiscordAPI } from "../../utils/discord";
import { getUserUrl, makeAvatarUrl } from "../../utils/functions";
import { convertPerms, PermissionFlags } from "../../utils/permission";

export default async (req: Request, res?: Response) => {
	if (req.body.data.component_type === ComponentType.Button) return await ButtonComponentHandler(req, res);
	return;
}

export const ButtonComponentHandler = async (req: Request, res?: Response) => {
	if (req.body.data.custom_id.startsWith("unban_")) {
		if (convertPerms(req?.body?.member?.permissions).includes(PermissionFlags.BanMembers)) return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				components: [req.body.message.components[0]]
			}
		}
		
		const UnbanInfo: Snowflake[] = String(req?.body?.data?.custom_id).split("_");
		const GetUserBan: APIBan | any = await DiscordAPI.get(Routes.guildBan(UnbanInfo[2], UnbanInfo[1]));
		console.log(UnbanInfo)
		if (!GetUserBan) return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "That user was not banned anymore",
				flags: MessageFlags.Ephemeral
			}
		}
		console.log(GetUserBan)
		return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				embeds: [
					{
						color: colors(Colors["BLACK.Ban"]),
						author: {
							name: `${GetUserBan?.user?.username}#${GetUserBan?.user?.discriminator} is now unbanned`,
							url: getUserUrl(GetUserBan?.user),
							icon_url: makeAvatarUrl(GetUserBan?.user)
						}
					}
				]
			}
		}
	}
	
	return;
}
