import React, { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { useParams } from "react-router-dom";
import config from "@/config.json";
import { BigNumberish, formatEther } from "ethers";
import eventsAbi from "@/abi/events.json";
import { AbiEvent } from "viem";
import { decodeEventLog } from "viem";
import { truncateWalletAddress } from "@/utils";

interface Props {
  supply: bigint;
  description: string;
  image: string;
}
interface Holder {
  address: string;
  balance: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

type BattleStatsArray = [
  bigint, // totalBattlesInitiated
  bigint, // totalBattlesParticipated
  bigint, // totalWins
  bigint, // totalVotes
  bigint, // lastBattleTime
  bigint, // lastWinTime
  boolean, // isKing
  bigint, // kingCrownedTime
];

type TokenData = [
  string, //name
  string, // ticker
  string, // description
  string, // image
  string, // owner (Ethereum address)
  number, // stage (uint8)
  bigint, // collateral (uint256)
  bigint, // createdAt (uint256)
];

interface DecodedLog {
  args: {
    amount: BigNumberish;
    buyer?: string;
    seller?: string;
    token: string;
    totalPrice: BigNumberish;
  };
}

const Trades = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const publicClient = usePublicClient();
  const [buyLogs, setBuyLogs] = useState([]);
  const [sellLogs, setSellLogs] = useState([]);
  const [trades, setTrades] = useState<DecodedLog[]>([]);

  //fetch buy logs
  const fetchBuyLogs = async () => {
    try {
      const logs = await publicClient?.getLogs({
        address: config.address as `0x${string}`,
        event: eventsAbi.tokensBought as AbiEvent,
        fromBlock: 0n, // Start block
        toBlock: "latest", // End block
        args: {
          token: tokenAddress, // Filter by indexed argument
        },
      });

      const decodedLogs = logs?.map((log) =>
        decodeEventLog({
          abi: [eventsAbi.tokensBought], // Pass the ABI array
          data: log.data,
          topics: log.topics,
        }),
      );
      //@ts-ignore
      setBuyLogs(decodedLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  //fetch buy logs
  const fetchSellLogs = async () => {
    try {
      const logs = await publicClient?.getLogs({
        address: config.address as `0x${string}`,
        event: eventsAbi.tokensSold as AbiEvent,
        fromBlock: 0n, // Start block
        toBlock: "latest", // End block
        args: {
          token: tokenAddress, // Filter by indexed argument
        },
      });

      const decodedLogs = logs?.map((log) =>
        decodeEventLog({
          abi: [eventsAbi.tokensSold], // Pass the ABI array
          data: log.data,
          topics: log.topics,
        }),
      );
      //@ts-ignore
      setSellLogs(decodedLogs);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  useEffect(() => {
    fetchBuyLogs();
    fetchSellLogs();
  }, [publicClient]);

  useEffect(() => {
    function mergeAndShuffle(sellLogs: DecodedLog[], buyLogs: DecodedLog[]) {
      // Merge the arrays
      const mergedArray = [...sellLogs, ...buyLogs];

      // Shuffle the merged array
      for (let i = mergedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [mergedArray[i], mergedArray[randomIndex]] = [
          mergedArray[randomIndex],
          mergedArray[i],
        ];
      }
      console.log(mergedArray);
      setTrades(mergedArray);
    }
    mergeAndShuffle(sellLogs, buyLogs);
  }, [sellLogs, buyLogs]);

  return (
    <div className="bg-black/30 text-gray-700 overflow-x-auto  dark:text-gray-300 py-3 rounded-md font-medium">
      <table className="min-w-full border-collapse  text-sm ">
        <thead>
          <tr className="border-b border-gray-500">
            <th className="px-3 py-2 text-center">Account</th>
            <th className="px-3 py-2 text-center">Type</th>
            <th className="px-3 py-2 text-center">Amount</th>
            <th className="px-3 py-2 text-center">Price</th>
          </tr>
        </thead>
        <tbody className="max-h-[100vh] overflow-y-auto ">
          {trades.map((trade, idx) => (
            <tr className="border-b border-gray-500" key={idx}>
              <td className="px-3 py-2 text-center">
                {truncateWalletAddress(trade.args.buyer || "") ||
                  truncateWalletAddress(trade.args.seller || "")}
              </td>
              <td className="px-3 py-2 text-center">
                {trade.args.buyer ? (
                  <span className="bg-green-600 rounded-md p-1">buy</span>
                ) : (
                  <span className="bg-red-600 rounded-md p-1">sell</span>
                )}
              </td>
              <td className="px-3 py-2 text-center ">
                {formatEther(trade.args.amount)}
              </td>
              <td className="px-3 py-2 text-center">
                {formatEther(trade.args.totalPrice)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Trades;
