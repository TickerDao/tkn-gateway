import { ethers } from "ethers";

let tknDataArray = []

const fetchTKNData = async () => {
  console.log("Fetching onchain data from tokenNameService")
  let provider = new ethers.JsonRpcProvider("https://eth-mainnet.alchemyapi.io/v2/XsXyaCp_rCyOPHHDmsCgrBCJyHuN-VzO");

  let tickerAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"string","name":"_name","type":"string"}],"name":"addressFor","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"}],"name":"addressesFor","outputs":[{"components":[{"internalType":"address payable","name":"arb1_address","type":"address"},{"internalType":"address payable","name":"avaxc_address","type":"address"},{"internalType":"address payable","name":"base_address","type":"address"},{"internalType":"address payable","name":"bsc_address","type":"address"},{"internalType":"address payable","name":"cro_address","type":"address"},{"internalType":"address payable","name":"ftm_address","type":"address"},{"internalType":"address payable","name":"gno_address","type":"address"},{"internalType":"address payable","name":"matic_address","type":"address"},{"internalType":"bytes","name":"near_address","type":"bytes"},{"internalType":"address payable","name":"op_address","type":"address"},{"internalType":"bytes","name":"sol_address","type":"bytes"},{"internalType":"bytes","name":"trx_address","type":"bytes"},{"internalType":"bytes","name":"zil_address","type":"bytes"},{"internalType":"address payable","name":"goerli_address","type":"address"},{"internalType":"address payable","name":"sepolia_address","type":"address"}],"internalType":"struct TNS.TokenAddresses","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"string","name":"tickerSymbol","type":"string"}],"name":"balanceWithTicker","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"}],"name":"dataFor","outputs":[{"components":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"url","type":"string"},{"internalType":"string","name":"avatar","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"notice","type":"string"},{"internalType":"string","name":"version","type":"string"},{"internalType":"string","name":"decimals","type":"string"},{"internalType":"string","name":"twitter","type":"string"},{"internalType":"string","name":"github","type":"string"},{"internalType":"bytes","name":"dweb","type":"bytes"},{"internalType":"address payable","name":"arb1_address","type":"address"},{"internalType":"address payable","name":"avaxc_address","type":"address"},{"internalType":"address payable","name":"base_address","type":"address"},{"internalType":"address payable","name":"bsc_address","type":"address"},{"internalType":"address payable","name":"cro_address","type":"address"},{"internalType":"address payable","name":"ftm_address","type":"address"},{"internalType":"address payable","name":"gno_address","type":"address"},{"internalType":"address payable","name":"matic_address","type":"address"},{"internalType":"bytes","name":"near_address","type":"bytes"},{"internalType":"address payable","name":"op_address","type":"address"},{"internalType":"bytes","name":"sol_address","type":"bytes"},{"internalType":"bytes","name":"trx_address","type":"bytes"},{"internalType":"bytes","name":"zil_address","type":"bytes"},{"internalType":"address payable","name":"goerli_address","type":"address"},{"internalType":"address payable","name":"sepolia_address","type":"address"}],"internalType":"struct TNS.Metadata","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"namehash","type":"bytes32"}],"name":"gasEfficientFetch","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_chainId","type":"uint256"},{"internalType":"string","name":"_name","type":"string"}],"name":"getContractForChain","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"}],"name":"infoFor","outputs":[{"components":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"url","type":"string"},{"internalType":"string","name":"avatar","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"notice","type":"string"},{"internalType":"string","name":"version","type":"string"},{"internalType":"string","name":"decimals","type":"string"},{"internalType":"string","name":"twitter","type":"string"},{"internalType":"string","name":"github","type":"string"},{"internalType":"bytes","name":"dweb","type":"bytes"}],"internalType":"struct TNS.TokenInfo","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}];
  let tickerContract = new ethers.Contract("tkn.eth", tickerAbi, provider);

  const response = await fetch('https://registry.tkn.eth.limo/');
  //const response = await fetch('https://gateway.pinata.cloud/ipfs/QmepqavpRncqCf8gWgCUV7siSxD92oBkL5yN72UKfKZiY3');
  const json = await response.json();

  console.log("Parsing", Object.keys(json).length, "tickers")

  let tokenArr = [];

  for (const [key, value] of Object.entries(json)) {
    let data = await tickerContract.dataFor(key.toLowerCase());

    let tokenObject = {
      name: data[1],
      url: data[2],
      avatar: data[3],
      description: data[4],
      notice: data[5],
      version: data[6],
      decimals: data[7],
      twitter: data[8],
      github: data[9],
      dweb: data[10] !== "0x" ? data[10] : null,
      symbol: key.toUpperCase(),
      addresses: []
    };

    if (data[0] && data[0] !== "0x" && data[0] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([1, data[0]]);
    if (data[11] && data[11] !== "0x" && data[11] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([42161, data[11]]);
    if (data[12] && data[12] !== "0x" && data[12] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([43114, data[12]]);
    if (data[13] && data[13] !== "0x" && data[13] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([8453, data[13]]);
    if (data[14] && data[14] !== "0x" && data[14] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([56, data[14]]);
    if (data[15] && data[15] !== "0x" && data[15] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([25, data[15]]);
    if (data[16] && data[16] !== "0x" && data[16] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([250, data[16]]);
    if (data[17] && data[17] !== "0x" && data[17] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([100, data[17]]);
    if (data[18] && data[18] !== "0x" && data[18] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([137, data[18]]);
    if (data[19] && data[19] !== "0x" && data[19] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push(["nonEVM", [397, data[19]]]);
    if (data[20] && data[20] !== "0x" && data[20] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([10, data[20]]);
    if (data[21] && data[21] !== "0x" && data[21] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push(["nonEVM", [501, data[21]]]);
    if (data[22] && data[22] !== "0x" && data[22] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push(["nonEVM", [195, data[22]]]);
    if (data[23] && data[23] !== "0x" && data[23] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push(["nonEVM", [119, data[23]]]);
    if (data[24] && data[24] !== "0x" && data[24] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([5, data[24]]);
    if (data[25] && data[25] !== "0x" && data[25] !== "0x0000000000000000000000000000000000000000") tokenObject.addresses.push([11155111, data[25]]);

    tknDataArray.push(tokenObject);
  }

  return tknDataArray
}

export { fetchTKNData }