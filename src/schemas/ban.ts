import { APIUser } from 'discord-api-types/v10';
import { model, Schema } from 'mongoose';

export interface DATABASEBan {
	_id?: any;
	unban_at?: string;
	guild_id: string;
	user: APIUser;
}

export default model("ban", new Schema<DATABASEBan>({
	unban_at: { type: String, required: true },
	guild_id: { type: String, required: true },
	user: { type: Schema.Types.Mixed, required: true }
}));
