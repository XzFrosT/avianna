import { REST } from '@discordjs/rest';

import { BotToken } from "./config";

export const DiscordAPI = new REST({ version: "10" }).setToken(BotToken);