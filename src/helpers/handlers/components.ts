import { APIBan, ComponentType, MessageFlags, InteractionResponseType, Routes, Snowflake } from 'discord-api-types/v10';
import { Request, Response } from 'express';

import bans from "../../schemas/ban";
import modlog from "../modlog";
import { getBan } from "../../commands/ban";
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
		if (!convertPerms(req?.body?.member?.permissions).includes(PermissionFlags.BanMembers)) return {
			type: InteractionResponseType.UpdateMessage,
			data: {
				components: [req.body.message.components[0]]
			}
		}
		
		const UnbanInfo: Snowflake[] = String(req?.body?.data?.custom_id).split("_")[1].split("@");
		const GetUserBan: APIBan | any = await getBan(DiscordAPI, UnbanInfo[1], UnbanInfo[0])
		
		if (!GetUserBan) return {
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "That user was not banned anymore",
				flags: MessageFlags.Ephemeral
			}
		}
		
		await DiscordAPI.delete(Routes.guildBan(UnbanInfo[1], UnbanInfo[0]));
		
		const IsTempBan = await bans.findOne({ 'user.id': GetUserBan?.user?.id });
		if (IsTempBan) await bans.deleteOne({ _id: IsTempBan._id });
		
		modlog(DiscordAPI, {
			action: "unban",
			user: GetUserBan?.user,
			moderator: req?.body?.member?.user,
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
