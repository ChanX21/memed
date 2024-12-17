import battleAbi from "./abi/memedBattle.json";
import { Address } from 'viem';

const config = {
  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address,
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
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
  battleAddress: "0x0321F3a61a486a18CFF4d451c2a9D34Bf360A5F8" as Address,
  battleAbi: battleAbi as any,
} as const;

console.log('Config loaded:', {
  factoryAddress: config.address,
  battleAddress: config.battleAddress,
  hasFactoryAbi: !!config.abi,
  hasBattleAbi: !!config.battleAbi,
});

export default config; 