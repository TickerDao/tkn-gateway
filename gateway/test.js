import {ethers} from 'ethers';
//import {fetch_record} from './json-storage.js';
import {fetch_record} from './evm-storage.js';

let labels = ['wsteth', 'base', 'tkn', 'eth'];

let rec = await fetch_record(labels);

//await fetch_record(labels);

console.log(rec);
