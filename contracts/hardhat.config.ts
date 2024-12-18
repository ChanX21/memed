import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";

const config: HardhatUserConfig = {
  networks: {
    bscTestnet: {
      url: `https://bsc-testnet.infura.io/v3/cd763583ae724e4fb5620a8f0bc5876f`,
      accounts: [vars.get('PRIVATE_KEY')],
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: vars.get('ETHERSCAN_API_KEY'),
    },
  },
  solidity: "0.8.28",
};

export default config;
