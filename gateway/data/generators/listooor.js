
const fetchListooorData = async () => {
  let listData = {};
  const lists = ["https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/1inch.json", 
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/aerodrome.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/ajna.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/bebop.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/cowswap.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/coingecko.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/curve.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/defillama.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/etherscan.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/ledger.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/messari.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/paraswap.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/portals.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/smolAssets.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/optimism.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/sushiswap.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/sushiswap-pairs.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/tokenlistooor.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/uniswap.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/uniswap-pairs.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/velodrome.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/wido.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/yearn.json",
    "https://raw.githubusercontent.com/Migratooor/tokenLists/main/lists/zksync.json"
    ]

  // Fetch all lists:
  for (let list of lists) {
    try {
      console.log("Fetching list: " + list)
      let response = await fetch(list, {
        method: "GET",
        headers: {"Accept-Encoding": "gzip, deflate"}
      });
      let data = await response.json();
      listData[list] = data.tokens;
    } catch (error) {
      console.error(`Failed to fetch data from ${list}`, error);
    }
  }

  return listData;
}

export { fetchListooorData }