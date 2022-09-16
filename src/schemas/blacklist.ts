import { model, Schema } from 'mongoose';

export interface DATABASEBlacklist {
	_id?: any;
	id: string;
	type: string;
}

export default model("blacklist", new Schema<DATABASEBlacklist>({
	id: { type: String, required: true },
	type: { type: String, required: true },
}));
