import { PermissionFlagsBits } from 'discord-api-types/v10';

export const PermissionFlags = swapPerms();

function swapPerms(): {[readablePermission: string]: string} {
	let Flags: {
		[key: string]: string
	} = {}
	
	Object.keys(PermissionFlagsBits).forEach((key: string) => {
		Object.defineProperty(Flags, key, {
			value: key,
			enumerable: true
		});
	});
	
	return Flags;
}

export function convertPerms(permNumber: bigint): string[] {
	let evaluatedPerms: {
		[permission: string]: number | bigint;
	} = {};
	
	for (let perm in PermissionFlagsBits) {
		let hasPerm = (BigInt(permNumber) & BigInt(PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits])) == BigInt(PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits]);
		
		if (hasPerm) Object.defineProperty(evaluatedPerms, perm, {
			enumerable: true,
			value: PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits]
		});
	}
	
	return Object.keys(
		Object.fromEntries(
			Object.entries(evaluatedPerms)
		)
	);
};