import { REST } from '@discordjs/rest';
import { APIEmbed, APIUser, Routes } from 'discord-api-types/v10';

import { ModLogChannelId } from "../utils/config";
import colors, { Colors } from "../utils/colors";
import { forHumans, getUserUrl, makeAvatarUrl, me } from "../utils/functions";

interface LogOptions {
	action: string;
	user: APIUser;
	moderator: APIUser | null;
	reason: string | null;
	channel: string | null;
	message: string | null;
	duration: string | number | null;
}

export default async (DiscordAPI: REST, Log: LogOptions): Promise<void> => {
	const ActionEmbedColor = (Object.keys(Colors)).filter((color: string) => color.toLowerCase().includes(Log.action+"log"))[0];
	const FieldsEmbed = [
		{
			name: "User",
			value: `<@${Log?.user?.id}>`,
			inline: true
		},
		{
			name: "Moderator",
			value: `<@${Log?.moderator ? Log?.moderator?.id : (await me()).id}>`,
			inline: true
		}
	]
	
	if (Log?.reason) FieldsEmbed.push({
		name: "Reason",
		value: `${Log?.reason}`,
		inline: true
	});
	
	if (Log?.channel) FieldsEmbed.push({
		name: "Channel",
		value: `<#${Log?.channel}>`,
		inline: false
	});
	
	if (Log?.message) FieldsEmbed.push({
		name: "Message",
		value: `${Log?.message}`,
		inline: false
	});
	
	if (Log?.duration) {
		FieldsEmbed.push({
			name: "Duration",
			value: `${typeof Log?.duration === "number" ? forHumans(Log?.duration) : Log?.duration}`,
			inline: false
		});
	}
	
	const ModLogEmbed: APIEmbed = {
		color: colors(Colors[ActionEmbedColor]),
		author: {
			name: `[${Log.action.toUpperCase()}] ${Log.user.username}#${Log.user.discriminator}`,
			url: getUserUrl(Log?.user),
			icon_url: makeAvatarUrl(Log?.user)
		},
		fields: FieldsEmbed
	};
	
	DiscordAPI.post(Routes.channelMessages(ModLogChannelId), {
		body: {
			embeds: [ModLogEmbed]
		}
	});
}
