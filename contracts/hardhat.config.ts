import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  networks: {
    bscTestnet: {
      url: `https://bsc-testnet.blockpi.network/v1/rpc/public`,
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
