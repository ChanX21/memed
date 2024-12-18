import battleAbi from "./abi/memedBattle.json";
import tokenAbi from "./abi/memedToken.json";
import { Address } from 'viem';

const config = {
  address: "0x2f766a04e25D07465877D8084bfBd5a1d7B58ec9" as Address,
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_token",
          "type": "address"
        }
      ],
      "name": "getTokens",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "token",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "ticker",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "image",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "enum Factory.TokenStages",
              "name": "stage",
              "type": "uint8"
            },
            {
              "internalType": "uint256",
              "name": "collateral",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "supply",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "createdAt",
              "type": "uint256"
            }
          ],
          "internalType": "struct Factory.AllTokenData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  battleAddress: "0x42719ec5b230F89020464bE44Ba0D68231EFb51B" as Address,
  battleAbi: battleAbi as any,
  tokenAbi: tokenAbi as any,
} as const;

console.log('Config loaded:', {
  factoryAddress: config.address,
  battleAddress: config.battleAddress,
  hasFactoryAbi: !!config.abi,
  hasBattleAbi: !!config.battleAbi,
  hasTokenAbi: !!config.tokenAbi,
});

export default config; 