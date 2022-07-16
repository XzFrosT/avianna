import { PermissionFlagsBits } from 'discord-api-types/v10';

export const PermissionFlags = swapPerms();

function swapPerms(): {[readablePermission: string]: string} {
	let Flags: {
		[key: string]: string
	} = {}
	
	Object.keys(PermissionFlagsBits).forEach((key) => {
		Object.defineProperty(Flags, key, {
			value: key,
			enumerable: true
		});
	});
	
	return Flags;
}

export function convertPerms(permNumber: bigint): string[] {
	let evaluatedPerms: {
		[key:string]: {
			[key:string]: number | bigint
		}
	} = {};
	
	for (let perm in PermissionFlagsBits) {
		let hasPerm = Boolean(BigInt(permNumber) & BigInt(PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits]));
		
		Object.defineProperty(evaluatedPerms, perm, {
			enumerable: true,
			value: {
				t: hasPerm ? 1 : 0,
				v: PermissionFlagsBits[perm as keyof typeof PermissionFlagsBits]
			}
		});
	}
	
	return Object.keys(
		Object.fromEntries(
			Object.entries(evaluatedPerms).filter(([key, value]) => value.t === 1)
		)
	);
};
