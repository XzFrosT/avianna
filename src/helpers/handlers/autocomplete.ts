import { APIBan, InteractionResponseType, Routes } from 'discord-api-types/v10';
import { Request, Response } from 'express';

import { DiscordAPI } from "../../utils/discord";

export default async (req: Request, res?: Response) => {
	if (req.body.data.name === "unban") return await unbanAutocomplete(req, res);
	return;
}

export const unbanAutocomplete = async (req: Request, res?: Response) => {
	const keyword = req.body?.data?.options.filter((option: any) => option.name === "user")[0].value;
	const GetBanList: APIBan[] | any = await DiscordAPI.get(Routes.guildBans(req.body?.guild_id));
	
	const FilterBansByName = GetBanList.filter((ban: APIBan | any) => `${ban?.user?.username}#${ban?.user?.discriminator}`.toLowerCase().includes(keyword.toLowerCase()));
	const FilterBansById = GetBanList.filter((ban: APIBan | any) => ban?.user?.id.includes(keyword.toLowerCase()));
	
	var Top25Bans = [...new Map(FilterBansByName.concat(FilterBansById).map((v: any) => [v.user.id, v])).values()].map((ban: APIBan | any) => { return {
		name: `${ban?.user?.username}#${ban?.user?.discriminator}`,
		value: `${ban?.user?.id}`
	}}).slice(0, 24);
	
	return {
		type: InteractionResponseType.ApplicationCommandAutocompleteResult,
		data: {
			choices: Top25Bans
		}
	}
}
