import battleAbi from "./abi/memedBattle.json";
import tokenAbi from "./abi/memedToken.json";
import { Address } from 'viem';

const config = {
  address: "0x2ebE9162A3c629c6e23689DD302A8efA1AcA6c3B" as Address,
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
  battleAddress: "0x6250550d1413F517C58095C248c45aFbF38E4Ff8" as Address,
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