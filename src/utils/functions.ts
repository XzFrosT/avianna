export function parseOptions(req: any, target: string) {
	const option = req.body.data.options.filter((opt: any) => opt.name === target)[0];
	
	return option.value;
}
