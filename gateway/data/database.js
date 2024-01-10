import Sequelize from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const { Model, DataTypes } = Sequelize;

const NetworkIDS = {
	"ethereum": 1, 
	"optimism": 10, 
	"arbitrum-one": 42161, 
	"base": 8453, 
	"avalanche": 43114, 
	"binance-smart-chain": 56, 
	"polygon-pos": 137, 
	"cronos": 25, 
	"xdai": 100, 
	"fantom": 250, 
	"pgn": 424, 
  "zksync": 324,

  "near-protocol": {"nonEvm": 397},
  "solana": {"nonEvm": 501},
  "tron": {"nonEvm": 195},
	"zilliqa": {"nonEvm": 119}, 

	"goerli": 5, 
	"sepolia": 11155111, 
	"optimism-goerli": 420, 
	"optimism-sepolia": 11155420, 
	"base-goerli": 84531, 
	"base-sepolia": 84532
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite')
  });

class Token extends Model {}
Token.init({
  name: DataTypes.STRING,
  symbol: DataTypes.STRING,
  description: DataTypes.STRING,
  url: DataTypes.STRING,
  avatar: DataTypes.STRING,
  twitter: DataTypes.STRING,
  github: DataTypes.STRING,
  decimals: DataTypes.INTEGER,
  notice: DataTypes.STRING,
  dweb: DataTypes.STRING,
  version: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      is: /^\d+\.\d+\.\d+$/ // Regular expression for format "0.0.1"
    }
  },
  source: { type: DataTypes.STRING },
  globalNamespace: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: false },
  unprocessedData: {
    type: DataTypes.JSON,
    allowNull: true },
  archived: { type: DataTypes.BOOLEAN },
  updateID: { // Pointer to the token with updated data that replaces this one
    type: DataTypes.INTEGER,
    references: {
      model: 'tokens', // 'tokens' refers to the table name
      key: 'id',
    },
    allowNull: true,
  },
}, { sequelize, modelName: 'token' });

class Address extends Model {}
Address.init({
  address: {
    type: DataTypes.STRING,
    validate: {
      is: /^0x[0-9a-fA-F]{40}$/ // Regular expressi
    },
  },
  chainID: {
    type: DataTypes.INTEGER,
    validate: {
      is: /^\d+$/ // Regular expressi
    },
  },
  nonEVMAddress: {
    type: DataTypes.STRING
  },
  slip55ID: {
    type: DataTypes.INTEGER
  },
  depreciated: {
    type: DataTypes.BOOLEAN
  },
  tokenID: {
    type: DataTypes.INTEGER,
    references: {
      model: 'tokens', // 'tokens' refers to the table name
      key: 'id',
    },
    allowNull: false,
  },
}, { sequelize, modelName: 'address' });

Address.belongsTo(Token, { foreignKey: 'tokenID' });
Token.hasMany(Address, { foreignKey: 'tokenID' });

sequelize.sync({ force: false }).then(() => {
  console.log('Token table created if it did not exist');
}).catch((error) => {
  console.error('Error creating Token table:', error);
});

export { sequelize, Token, Address, NetworkIDS };