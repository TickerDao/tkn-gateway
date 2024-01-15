import { ethers } from "ethers";
import { ALCHEMY_POLYGON_PROVIDER, L2_STORAGE_CONTRACT } from '../constants.js';
import {sequelize, NetworkIDS, Token, Address, PublicTokenValues, PublicAddressValues} from './database.js';

// Define the maximum number of retries
const MAX_RETRIES = 8;

async function setStringWithRetry(contract, method, args) {
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const tx = await contract[method](...args);
            await tx.wait();
            return tx;
        } catch (error) {
            if (error.message.includes('ETIMEDOUT')) {
                console.log(`Timeout error occurred. Retrying ${i + 1} of ${MAX_RETRIES}...`);
            } else {
                // If the error is not ETIMEDOUT, rethrow it
                throw error;
            }
        }
    }
    throw new Error(`Failed to call ${method} after ${MAX_RETRIES} retries due to ETIMEDOUT`);
}

(async () => {
    let provider = new ethers.JsonRpcProvider(ALCHEMY_POLYGON_PROVIDER);
    let l2StorageContractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"op","type":"address"},{"indexed":true,"internalType":"bool","name":"admin","type":"bool"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"node","type":"string"},{"indexed":true,"internalType":"string","name":"key","type":"string"},{"indexed":false,"internalType":"uint256","name":"nonce","type":"uint256"}],"name":"DataChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"string","name":"key","type":"string"},{"indexed":false,"internalType":"bytes","name":"value","type":"bytes"}],"name":"GraphAddressBytesChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"string","name":"key","type":"string"},{"indexed":true,"internalType":"string","name":"value","type":"string"}],"name":"GraphAddressChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"string","name":"key","type":"string"},{"indexed":false,"internalType":"bytes","name":"value","type":"bytes"}],"name":"GraphTokenBytesChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"string","name":"key","type":"string"},{"indexed":true,"internalType":"string","name":"value","type":"string"}],"name":"GraphTokenChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"inputs":[{"internalType":"string","name":"node","type":"string"},{"internalType":"string[]","name":"keys","type":"string[]"}],"name":"getBatchData","outputs":[{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"bytes[]","name":"vs","type":"bytes[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"node","type":"string"},{"internalType":"string","name":"key","type":"string"}],"name":"getData","outputs":[{"internalType":"bytes","name":"v","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"node","type":"string"}],"name":"getNonce","outputs":[{"internalType":"uint256","name":"nonce","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes[]","name":"calls","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"results","type":"bytes[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"op","type":"address"},{"internalType":"bool","name":"admin","type":"bool"}],"name":"setAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"node","type":"string"},{"internalType":"string","name":"key","type":"string"},{"internalType":"bytes","name":"v","type":"bytes"}],"name":"setData","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"node","type":"string"},{"internalType":"string","name":"key","type":"string"},{"internalType":"bytes","name":"v","type":"bytes"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"setDataWithGraphAddressData","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"node","type":"string"},{"internalType":"string","name":"key","type":"string"},{"internalType":"bytes","name":"v","type":"bytes"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"setDataWithGraphTokenData","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"node","type":"string"},{"internalType":"string","name":"key","type":"string"},{"internalType":"string","name":"s","type":"string"}],"name":"setString","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"node","type":"string"},{"internalType":"string","name":"key","type":"string"},{"internalType":"string","name":"s","type":"string"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"setStringWithGraphAddressData","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"node","type":"string"},{"internalType":"string","name":"key","type":"string"},{"internalType":"string","name":"s","type":"string"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"setStringWithGraphTokenData","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"x","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
    let l2StorageContract = new ethers.Contract("0x35b4293d527964c017c072d80713CA1A3d2FD206", l2StorageContractABI, provider);
    const privateKey = "a4d35795f99a37911a8a0fa07a8423508d6721d613680a5bece13c3f282c5aaa";
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(provider);
    l2StorageContract = l2StorageContract.connect(signer);

    try {
        const tokens = await Token.findAll({
            where: {
                source: "token-name-service"
            },
            include: [{
                model: Address,
            }]
        });
        console.log("Token count:" + tokens.length);

        for (const token of tokens) {
            const addresses = token.addresses
            let namehash = ethers.namehash(`${token.symbol}.tkn.eth`);

            for (const key in token.dataValues) {
                let value = token.dataValues[key];

                if (!value || !PublicTokenValues.includes(key) || (key == "archived" && value)) continue;
                console.log(`Token: ${key}: ${token.dataValues[key]}`);

                await setStringWithRetry(l2StorageContract, 'setStringWithGraphTokenData', [namehash, key, value, token.id]);

                // const tx = await l2StorageContract.setStringWithGraphTokenData(
                //     namehash,
                //     key,
                //     value,
                //     // ethers.utils.formatBytes32String("value"),
                //     token.id
                // );
                // await tx.wait();
            }

            for (const address of addresses) {
                for (const key in address.dataValues) {
                    let addressValue = address.dataValues[key]

                    if (!addressValue || key == "id" || !PublicAddressValues.includes(key)) continue;
                    console.log(`Address: ${key}: ${addressValue}`);

                    await setStringWithRetry(l2StorageContract, 'setStringWithGraphAddressData', [namehash, key, addressValue, address.id]);

                    // const tx = await l2StorageContract.setStringWithGraphAddressData(
                    //     namehash,
                    //     key,
                    //     addressValue,
                    //     address.id
                    // );
                    // await tx.wait();

                }
            }
        }

    } catch (error) {
        console.error('Error fetching Tokens with Addresses:', error);
    }

})();
