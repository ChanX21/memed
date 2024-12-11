import { usePublicClient, useWatchContractEvent } from "wagmi";
import { decodeEventLog } from "viem";
import config from "@/config.json";

import tokenAbi from "@/abi/erc20.json";

interface Holder {
  address: string;
  balance: number;
}

export const useTokenHolders = () => {
  const publicClient = usePublicClient();

  const fetchTokenHolders = async (address: string): Promise<Holder[]> => {
    const balances: Record<string, bigint> = {};

    // Define onLogs function to process Transfer event logs
    const onLogs = (logs: any) => {
      console.log(lo);
      logs.forEach((log: any) => {
        const decodedLog = decodeEventLog({
          abi: tokenAbi,
          data: log.data,
          topics: log.topics,
        });

        if (decodedLog && decodedLog.args) {
          const { from, to, value } = decodedLog.args as {
            from: `0x${string}`;
            to: `0x${string}`;
            value: bigint;
          };

          // Deduct from sender's balance (avoid burning or minting events)
          if (from !== "0x0000000000000000000000000000000000000000") {
            balances[from] = (balances[from] || BigInt(0)) - value;
          }

          // Add to recipient's balance
          balances[to] = (balances[to] || BigInt(0)) + value;
        }
      });
    };

    // Watch for Transfer events on the token contract
    useWatchContractEvent({
      address: address as `0x${string}`,
      abi: tokenAbi,
      eventName: "Transfer",
      onLogs,
    });

    // Return balances once processed
    const holders: Holder[] = Object.entries(balances)
      .filter(([_, balance]) => balance > 0) // Filter out zero balances
      .map(([address, balance]) => ({
        address,
        balance: Number(balance) / 10 ** 18, // Convert balance to human-readable format (with 18 decimals)
      }));

    return holders;
  };

  return fetchTokenHolders;
};
