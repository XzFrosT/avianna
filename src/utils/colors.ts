export default (color: string): number => {
	if (color === 'RANDOM') return Math.floor(Math.random() * (0xffffff + 1));
	if (color === 'DEFAULT') return 0;
	
	return parseInt(color.replace('#', ''), 16);
}

export const Colors: { [key: string]: string } = {
	"BLACK.Ban": "#2a2b2d",
	"GREEN.unban": "",
	"RED.BanLog": "#eb4a4a"
}
