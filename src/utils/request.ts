const fetch = require('node-fetch');

export default async (path: any, data: any) => {
	const Url = "https://discord.com/api/v10" + path;
	
	if (data.body) data.body = JSON.stringify(data.body);
	
	const req = await fetch(Url, {
		headers: {
			Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
			'Content-Type': "application/json; charset=UTF-8"
		},
		...data
	});
	
	if (!req.ok) {
    const data = await req.json();
    console.log(req.status);
    throw new Error(JSON.stringify(data));
  }
	
	return req;
}
