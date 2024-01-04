export const PRIVATE_KEY = '0xbd1e630bd00f12f0810083ea3bd2be936ead3b2fa84d1bd6690c77da043e9e02';
export const HTTP_PORT = 8014;
export const L1_RESOLVER_ADDRESS = '0xF2C43c6389638Fc07b31FC78Ba06928a029bFCAB';
export const L2_STORAGE_ADDRESS = '0x0d3e01829E8364DeC0e7475ca06B5c73dbA33ef6';

// https://github.com/satoshilabs/slips/blob//master/slip-0044.md
export const COIN_MAP = new Map([
	[60, 'contractAddress'],
	[0, 'btc_address'],
	[2, 'ltc_address'],
	[3, 'doge_address'],
	[614, 'op_address'],
	[714, 'bnb_address'],
	[9001, 'arb1_address'],
]);