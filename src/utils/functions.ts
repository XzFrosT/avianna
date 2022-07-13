import { Request } from 'express';

export function parseOptions(req: Request, target: string) {
	const option = req.body.data.options.filter((opt: any) => opt.name === target)[0];
	
	return option.value;
}
