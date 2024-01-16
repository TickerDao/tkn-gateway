import axios from 'axios';
import {sequelize, NetworkIDS, Token, Address} from './database.js';
import { fetchTKNData } from './generators/tokenNameService.js';
import { fetchListooorData } from './generators/listooor.js';

(async () => {
  console.log("Fetching token data...");

  // Get onchain TKN data
  let tknData = await fetchTKNData()
  for (let tokenObject of tknData) {
    // Start a new transaction
    const transaction = await sequelize.transaction();

    try {
      // Create a new token
      const token = await Token.create({ 
        name: tokenObject.name,
        symbol: tokenObject.symbol,
        version: tokenObject.version,
        decimals: tokenObject.decimals,
        description: tokenObject.description,
        url: tokenObject.url,
        twitter: tokenObject.twitter ? tokenObject.twitter.replace(/^@/, '') : undefined,
        github: tokenObject.github,
        avatar: tokenObject.avatar,
        notice: tokenObject.notice,
        dweb: tokenObject.dweb,
        source: "token-name-service",
        globalNamespace: true,
        isChainWithChainID: tokenObject.isChainWithChainID,
        isChainWithCoinType: tokenObject.isChainWithCoinType
      }, { transaction });

      for (let addressData of tokenObject.addresses) {
        // Create new addresses associated with the token
        if (addressData[0] == "nonEVM") {
          const addresses = await Address.bulkCreate([
            { nonEVMAddress: addressData[1][1], coinTypeID: addressData[1][0], tokenID: token.id },
          ], { transaction });
        } else {
          const addresses = await Address.bulkCreate([
            { address: addressData[1], chainID: addressData[0], tokenID: token.id },
          ], { transaction });
        }
      }

      // If everything goes well, commit the transaction
      await transaction.commit();
    } catch (error) {
      // If there's an error, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  }

  // Listooor lists: 
  let listooorData = await fetchListooorData()

  for (let [list, tokenValues] of Object.entries(listooorData)) {
    // Your code here
    for (let tokenValue of tokenValues) {
      const address = await Address.findOne({
        where: {
          address: tokenValue.address,
          chainID: tokenValue.chainId
        },
        include: Token
      });

      if (address) {
        // Update the associated token
        // await address.token.update({
        //   name: 'New Name',
        //   symbol: 'New Symbol',
        //   // ... other fields you want to update
        // });
      } else {
        // Create new token
        const transaction = await sequelize.transaction();

        try {
          // Create a new token
          const token = await Token.create({ 
            name: tokenValue.name,
            symbol: tokenValue.symbol,
            decimals: tokenValue.decimals,
            avatar: tokenValue.logoURI,
            version: "0.0.1",
            source: list + "-tokenlist"
          }, { transaction });
        
          // Create new address associated with the token
          const address = await Address.create({
            address: tokenValue.address,
            chainID: tokenValue.chainId,
            tokenID: token.id
          }, { transaction });
        
          // If everything goes well, commit the transaction
          await transaction.commit();
        } catch (error) {
          // If there's an error, rollback the transaction
          await transaction.rollback();
          throw error;
        }
      }
    }
  }
  console.log("Finished parsing tokenlists")


  // Migrate data onchain


  

  // OP Superchain Token List:
  let responseData = [];
  let jsonDataResponses = [];
  let page = 1;
  let per_page = 100;
  const headers = {
    "Accept": "application/vnd.github.v3+json",
    "Authorization": `Bearer ${"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"}`,
    "User-Agent": "MyApp",
      "X-GitHub-Api-Version": "2022-11-28"
  };
  do {
    console.log(`Superchain Token List: Fetching page ${page}...`);
    try {
      let response = await axios({
        "method": "GET",
        "url": `https://api.github.com/repos/ethereum-optimism/ethereum-optimism.github.io/contents/data?page=${page}&per_page=${per_page}`,
        headers
      });
      responseData.push(...response.data);
      page++;
    } catch (error) {
      console.error(error);
      break;
    }
  } while (responseData.length % per_page === 0);

  let rateLimit = 5000;
  let requests = 0;
  let startTime = Date.now();
  for (let item of responseData) {
    if (requests >= rateLimit) {
      let timeElapsed = Date.now() - startTime;
      if (timeElapsed < 3600000) {
        await new Promise(resolve => setTimeout(resolve, 3600000 - timeElapsed));
        requests = 0;
        startTime = Date.now();
      }
    }
    let tickerUrl = item.url.substring(0, item.url.lastIndexOf('/')) + '/' + item.name + '/data.json';
      let logoSVGUrl = `https://raw.githubusercontent.com/ethereum-optimism/ethereum-optimism.github.io/master/data/${item.name}/logo.svg`
      let logoPNGUrl = `https://raw.githubusercontent.com/ethereum-optimism/ethereum-optimism.github.io/master/data/${item.name}/logo.png`
      let logoUrl;
      try {
          await axios.head(logoSVGUrl, { headers });
          logoUrl = logoSVGUrl;
      } catch (svgError) {
          try {
              await axios.head(logoPNGUrl, { headers });
              logoUrl = logoPNGUrl;
          } catch (pngError) {
              console.error(`No logo found for ${item.name}`);
          }
      }
    try {
      let tickerResponse = await axios.get(tickerUrl, { headers });
      let tickerData = tickerResponse.data.content;
      let decodedData = Buffer.from(tickerData, 'base64').toString();
      let jsonData = JSON.parse(decodedData);
      jsonDataResponses.push(jsonData);
      console.log(`Fetched ${item.name}`);

          // Save to database:
          let token = new Token({ symbol: item.name,
              version: "0.0.1",
              name: jsonData.name,
              decimals: jsonData.decimals,
              description: jsonData.description,
              url: jsonData.website,
              twitter: jsonData.twitter ? jsonData.twitter.replace(/^@/, '') : undefined,
              avatar: logoUrl,
              source: "op-superchain-token-list"
          });

          // Ensure the addresses object exists
          token.addresses = token.addresses || {};

          // Add the new addresses
          Object.entries(jsonData.tokens).forEach(([chain, details]) => {
              token.addresses[evmMapping[chain]] = details.address;
          });

          await token.save();

      requests++;
    } catch (error) {
      console.error(`Failed to fetch data from ${tickerUrl}`, error);
    }
  }

  console.log(jsonDataResponses);

})();