import { REST } from '@discordjs/rest';
import { APIEmbed, APIUser, Routes } from 'discord-api-types/v10';

import { ModLogChannelId } from "../utils/config";
import colors, { Colors } from "../utils/colors";
import { forHumans, getUserUrl, makeAvatarUrl, me } from "../utils/functions";

interface LogOptions {
	action: string;
	user: APIUser;
	moderator?: APIUser | null;
	reason?: string | null;
	channel?: string | null;
	message?: string | null;
	duration?: string | number | null;
}

export default async (DiscordAPI: REST, Log: LogOptions): Promise<void> => {
	const ActionEmbedColor = (Object.keys(Colors)).filter((color: string) => color.toLowerCase().split(".")[1] === Log.action+"log")[0];
	const FieldsEmbed = [];
	
	for (var k in {...Log}) {
		if ({...Log}.hasOwnProperty(k) && {...Log}[k] !== null && k !== "action") FieldsEmbed.push({
			name: `${k.charAt(0).toUpperCase()}${k.slice(1)}`,
			value: String((typeof {...Log}[k] === "object")? `<@${({...Log}[k] as APIUser)?.id}>`: ((k === "duration")? forHumans(Number({...Log}[k])): {...Log}[k])),
			inline: (k === "message" || k === "duration")? true: false,
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