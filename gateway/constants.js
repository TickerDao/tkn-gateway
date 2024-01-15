// constants.js

const ALCHEMY_API_KEY_ETH = "XsXyaCp_rCyOPHHDmsCgrBCJyHuN-VzO";
const ALCHEMY_API_URL_ETH = "https://eth-mainnet.alchemyapi.io/v2/";
const ALCHEMY_API_KEY_POLYGON = "C9n0KOTzda-5ceRApCcELXPVY2medteT";
const ALCHEMY_API_URL_POLYGON = "https://polygon-mainnet.g.alchemy.com/v2/";

export const ALCHEMY_MAINNET_PROVIDER = ALCHEMY_API_URL_ETH + ALCHEMY_API_KEY_ETH;
export const ALCHEMY_POLYGON_PROVIDER = ALCHEMY_API_URL_POLYGON + ALCHEMY_API_KEY_POLYGON;

export const L2_STORAGE_CONTRACT = "0x35b4293d527964c017c072d80713ca1a3d2fd206"