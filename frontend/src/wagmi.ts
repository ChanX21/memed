import { createConfig, http } from "wagmi";
import { Chain } from "@rainbow-me/rainbowkit";

import { bsc, bscTestnet } from "wagmi/chains";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";

import {
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { uxuyWallet } from "./wallets/uxuyWallet";

const chains: readonly [Chain, ...Chain[]] = [bsc, bscTestnet];

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      // @ts-ignore
      wallets: [uxuyWallet, rainbowWallet, walletConnectWallet],
    },
  ],
  {
    appName: "Memed",
    projectId: "321057023fa9e8ca9d5e1b71d0492af5",
  },
);

export const config = createConfig({
  // use rainbowkit wallets
  connectors,

  // only use wagmin connectors
  // connectors:[uxuyWalletConnector],
  chains: chains,

  // https://wagmi.sh/react/api/transports
  transports: {
    [bsc.id]: http("<YOUR_RPC_URL>"),
    [bscTestnet.id]: http("https://bsc-testnet.blockpi.network/v1/rpc/public"),
  },
});
