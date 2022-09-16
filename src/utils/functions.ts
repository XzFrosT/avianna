import { APIGuildMember, APIUser, ApplicationCommandOptionType, DefaultUserAvatarAssets, ImageFormat, RouteBases, Routes, Snowflake } from 'discord-api-types/v10';
import { Request } from 'express';

import { DiscordAPI } from "./discord";

export function forHumans(ms: number): string {
	var seconds: number = Number((ms/1000).toFixed(0));
	var returntext = "";
	var levels = [
		[Math.floor(seconds / 31536000), 0],
		[Math.floor((seconds % 31536000) / 86400), 1],
		[Math.floor(((seconds % 31536000) % 86400) / 3600), 2],
		[Math.floor((((seconds % 31536000) % 86400) % 3600) / 60), 3],
		[(((seconds % 31536000) % 86400) % 3600) % 60, 4]
	];
	var units = ["years", "days", "hours", "minutes", "seconds"];
	
	for (var i = 0, max = levels.length; i < max; i++) {
		if (levels[i][0] === 0) continue;
		
		returntext += ' ' + levels[i][0] + ' ' + (levels[i][0] === 1 ? units[levels[i][1]].substr(0, units[levels[i][1]].length - 1) : units[levels[i][1]]);
	};
	
	return returntext.trim();
}

export async function getDiscordUser(userId: Snowflake): Promise<APIUser | any> {
	try {
		return await DiscordAPI.get(Routes.user(userId));
	} catch(error: any) {
		console.error(error);
		return null;
	}
}

export async function getGuildMember(guildId: Snowflake, userId: Snowflake): Promise<APIGuildMember | any> {
	try {
		return await DiscordAPI.get(Routes.guildMember(guildId, userId));
	} catch(error: any) {
		console.error(error);
		return null;
	}
}

export function getUserUrl(user: APIUser) {
	return `https://discord.com/users/${user.id}`;
}

export function makeAvatarUrl(user: APIUser) {
	if (!user.avatar) return `${RouteBases.cdn}/embed/avatars/${Number(user.discriminator) % 5}.png`;
	
	let format = ImageFormat.WebP;
	if (user.avatar.startsWith("a_")) format = ImageFormat.GIF
	return `${RouteBases.cdn}/avatars/${user.id}/${user.avatar}.${format}`;
}

export async function me(): Promise<APIUser | any> {
	try {
		return await DiscordAPI.get(Routes.user());
	} catch(error: any) {
		console.error(error);
		return null;
	}
}

export function parseOptions(req: Request, optionName: string): any {
	const option = req.body.data.options.filter((opt: any) => opt.name === optionName)[0];
	
	if (!option) return null;
	
	if (option.type === ApplicationCommandOptionType.User) {
		if ('members' in req.body.data.resolved) {
			return {
				user: { ...req.body.data.resolved.users[option.value] },
				member: { ...req.body.data.resolved.members[option.value] }
			}
		} else return { user: req.body.data.resolved.users[option.value] };
	} else if (option.type === ApplicationCommandOptionType.String) {
		return option.value;
	}
}
