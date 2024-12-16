import React, { useState } from "react";
import { useReadContract } from "wagmi";
import { useParams } from "react-router-dom";
import { BattleChart } from "./BattleChart";
import { GrTransaction } from "react-icons/gr";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import {
  MdFingerprint,
  MdOutlinePriceChange,
  MdOutlineSavings,
} from "react-icons/md";
import { AiOutlineLineChart } from "react-icons/ai";
import memedBattle from "@/abi/memedBattle.json";
import config from "@/config.json";
import { BigNumberish, formatEther } from "ethers";
import tokenAbi from "@/abi/erc20.json";

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

const TokenStats: React.FC = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [percCompleted, setPercCompleted] = useState<number>(0);

  const { data }: { data: BattleStatsArray | undefined } = useReadContract({
    abi: memedBattle.abi,
    address: memedBattle.address as `0x${string}`,
    functionName: "tokenStats",
    args: [tokenAddress],
  });
  const { data: tokenData }: { data: TokenData | undefined } = useReadContract({
    abi: config.abi,
    address: config.address as `0x${string}`,
    functionName: "tokenData",
    args: [tokenAddress],
  });

  // Using the useReadContract hook to get the total supply of a token
  const { data: totalSupply }: { data: BigNumberish | undefined } =
    useReadContract({
      abi: tokenAbi, // The ABI of the token contract
      address: tokenAddress as `0x${string}`, // The token's contract address
      functionName: "totalSupply", // The function to get the total supply of the token
    });

  // Using the useReadContract hook to get the BNB cost based on token supply and price feed data
  const { data: bnbCost }: { data: BigNumberish[] | undefined } =
    useReadContract({
      abi: config.abi, // The ABI of the contract that handles BNB cost calculations
      address: config.address as `0x${string}`, // The contract address of the BNB cost calculation contract
      functionName: "getBNBAmount", // Function to get the BNB cost based on the total supply of the token
      args: [tokenAddress, totalSupply], // Arguments: token address and its total supply
    });

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-2 px-3 gap-4">
      <div className="h-full flex w-full flex-col justify-center ">
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <GrTransaction size={25} className="text-gray-500" />
            <p>Total transactions</p>
          </div>
          <div className="font-semibold">1000</div>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <GiReceiveMoney size={25} className="text-gray-500" />
            <p> Sells</p>
          </div>
          <div className="font-semibold">1000</div>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <GiPayMoney size={25} className="text-gray-500" />
            <p> Buys</p>
          </div>
          <div className="font-semibold">1000</div>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <MdOutlineSavings size={25} className="text-gray-500" />
            <p> Collateral</p>
          </div>
          <div className="font-semibold">
            {tokenData ? formatEther(tokenData[6]) : "Loading..."}
          </div>
        </div>

        {/* <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <MdOutlinePriceChange size={25} className="text-gray-500" />
            <p> Price (BNB)</p>
          </div>
          <div className="font-semibold">
            {bnbCost ? formatEther(bnbCost[0]) : 0}
          </div>
        </div> */}
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <AiOutlineLineChart size={25} className="text-gray-500" />
            <p> Battles</p>
          </div>
          <div className="font-semibold">
            {data ? Number(data[1]) : "Loading..."}
          </div>
        </div>
        <div className="flex justify-between py-3 border-b border-gray-500">
          <div className="flex items-center gap-3">
            <MdFingerprint size={25} className="text-gray-500" />
            <p> Votes</p>
          </div>
          <div className="font-semibold">
            {data ? Number(data[3]) : "Loading..."}
          </div>
        </div>
      </div>

      <div className="h-full hidden lg:block">
        <BattleChart data={data} tokenData={tokenData} />
      </div>
    </div>
  );
};

export default TokenStats;
