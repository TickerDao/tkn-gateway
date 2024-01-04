import {createServer} from 'node:http';
import './http.js';
import {log, is_hex, is_address, buf_from_hex, method_int32} from './utils.js';
import {handle_resolve} from './ensip10.js';
//import {fetch_record} from './evm-storage.js';
import {fetch_record} from './json-storage.js';
import {HTTP_PORT, L1_RESOLVER_ADDRESS} from './config.js';

const METHOD_resolve = method_int32('resolve(bytes,bytes)');

const http = createServer(async (req, reply) => {
	try {
		let url = new URL(req.url, 'http://a');
		reply.setHeader('access-control-allow-origin', '*');
		switch (req.method) {
			case 'GET': {
				return reply.end('TKN Gateway');
			}
			case 'OPTIONS': {
				reply.setHeader('access-control-allow-headers', '*');
				return reply.end();
			}
			case 'POST': {
				if (url.pathname === '/ccip') {
					return handle_ccip(req, reply);
				} else {
					reply.statusCode = 404;
					return reply.end('file not found');
				}
			}
			default: {
				reply.statusCode = 400;
				return reply.end('unsupported http method');
			}
		}
	} catch (err) {
		log(req.method, req.url, err);
		reply.statusCode = 500;
		return reply.end(err.message);
	}
});

await http.start_listen(HTTP_PORT);
log(`Listening on ${http.address().port}`);

// https://eips.ethereum.org/EIPS/eip-3668
async function handle_ccip(req, reply) {
	try {
		let {sender, data} = await req.read_json();
		if (!is_address(sender)) throw 'invalid sender';
		if (!is_hex(data)) throw 'invalid data';
		if (sender.localeCompare(L1_RESOLVER_ADDRESS, undefined, {sensitivity: 'base'})) {
			reply.statusCode = 404;
			return reply.json({message: 'unexpected contract'});
		}
		data = buf_from_hex(data);
		if (data.length < 4 || data.readUInt32BE() !== METHOD_resolve) throw `unsupported ccip method`;
		data = await handle_resolve(sender, data, fetch_record);
		return reply.json({data});
	} catch (err) {
		if (err instanceof String) {
			reply.statusCode = 400;
			return reply.json({message: err});
		} else {
			reply.statusCode = 500;
			return reply.json({message: err.message})
		}
	}
}

