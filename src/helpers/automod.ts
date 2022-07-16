import { Routes } from 'discord-api-types/v10';

import modlog from "./modlog";
import bans, { DATABASEBan } from "../schemas/ban";
import { DiscordAPI } from "../utils/discord";

export const unbanChecker = () => {
	setInterval(async () => {
		await bans.find().then((bansDoc: any) => {
			bansDoc.forEach(async (ban: DATABASEBan) => {
				const ExpiredDate = Number(ban.unban_at);
				
				if (Date.now() >= ExpiredDate) {
					await bans.deleteOne({ _id: ban._id });
					
					try {
						const GetUserBan = await DiscordAPI.get(Routes.guildBan(ban?.guild_id, ban?.user?.id));
						
						if (GetUserBan) {
							const UnbanReason = "temporary ban expired";
							
							await DiscordAPI.delete(Routes.guildBan(ban?.guild_id, ban?.user?.id), {
								headers: {
									'X-Audit-Log-Reason': UnbanReason
								}
							});
							
							modlog(DiscordAPI, {
								action: "unban",
								user: ban.user,
								moderator: null,
								reason: UnbanReason,
								channel: null,
								message: null,
								duration: null
							});
						}
					} catch(error: any) {
						return;
					}
				}
			})
		})
	}, 30000);
}
