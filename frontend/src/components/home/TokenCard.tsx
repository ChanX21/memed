import React, { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Progress } from "../ui/progress";
import { BigNumberish, formatEther, parseEther } from "ethers";
import config from "@/config.json";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { Link, useParams } from "react-router-dom";
import tokenAbi from "@/abi/erc20.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { formatDistanceToNow } from "date-fns";
import priceFeedAbi from "@/abi/PriceFeed.json";

interface Props {
  coin: any;
}

const TokenCard: React.FC<Props> = ({ coin }) => {
  const [marketCap, setMarketCap] = useState<number>(0);
  const [percCompleted, setPercCompleted] = useState<number>(0);

  const { data: totalSupply }: { data: BigNumberish | undefined } =
    useReadContract({
      abi: tokenAbi,
      address: coin.token as `0x${string}`,
      functionName: "totalSupply",
    });

  const { data: bnbFeed }: { data: BigNumberish[] | undefined } =
    useReadContract({
      abi: priceFeedAbi,
      address: import.meta.env.VITE_BNB_FEED as `0x${string}`,
      functionName: "latestRoundData",
    });

  const formatCurrency = (value: number) => {
    const units = [
      { threshold: 1e12, suffix: "T" }, // Trillion
      { threshold: 1e9, suffix: "B" }, // Billion
      { threshold: 1e6, suffix: "M" }, // Million
      { threshold: 1e3, suffix: "K" }, // Thousand
    ];

    // Assume the value is already in the desired unit
    const amount = value; // Directly use the number

    // Find the appropriate unit
    for (const unit of units) {
      if (amount >= unit.threshold) {
        const scaledValue = amount / unit.threshold;
        return `${scaledValue.toFixed(2)} ${unit.suffix} USD`; // Adjust decimal precision as needed
      }
    }

    // Default formatting for smaller numbers
    return Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  useEffect(() => {
    if (!totalSupply) return;
    const initialSupply = 200000000;
    const currentSupply = Number(formatEther(totalSupply));
    const perc = ((currentSupply - initialSupply) / currentSupply) * 100;

    setPercCompleted(perc);
  }, [totalSupply]);

  useEffect(() => {
    const usdRate = bnbFeed && Number(bnbFeed[1]) / Math.pow(10, 8);

    const result =
      totalSupply && usdRate && usdRate * Number(formatEther(totalSupply));
    setMarketCap(result as number);
  }, [bnbFeed, totalSupply]);
  return (
    <Link to={`coin/${coin.token}`}>
      <Card className="w-full max-w-[400px]">
        <CardHeader>
          <CardTitle className="text-sm flex justify-between items-center">
            <div className="flex gap-2">
              <p className="text-gray-500">By: </p>
              <p className="">
                {`${coin.owner.slice(0, 4)}...${coin.owner.slice(-4)}`}{" "}
              </p>
            </div>

            <p className="text-gray-500 text-sm">
              {formatDistanceToNow(
                new Date(parseInt(coin.createdAt.toString()) * 1000),
                { addSuffix: true },
              )}
            </p>
          </CardTitle>
          {/* <CardDescription className="h-56"></CardDescription> */}
        </CardHeader>
        <CardContent>
          <img
            src={import.meta.env.VITE_REACT_APP_IPFS_GATEWAY + coin.image}
            alt={coin.name}
            className="w-full h-full rounded-xl"
          />
        </CardContent>
        <CardDescription className=" px-6 flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <h4 className="font-semibold">{coin.name}</h4>
            <span className="text-primary font-semibold text-md">
              {formatCurrency(marketCap)}
            </span>
          </div>
          <div className="  w-full">
            {coin.description.substring(0, 100)}
            {"   "}
            {coin.description.length > 100 && (
              <span className="font-semibold hover:underline cursor-pointer ">
                More...
              </span>
            )}
          </div>
        </CardDescription>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </Link>
  );
};

export default TokenCard;
