import React, { useEffect, useState } from "react";
import { BigNumberish, formatEther, parseEther } from "ethers";
import { useReadContract } from "wagmi";
import { Link } from "react-router-dom";
import tokenAbi from "@/abi/erc20.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import config from "@/config.json";
import { formatDistanceToNow } from "date-fns";
import priceFeedAbi from "@/abi/priceFeed.json";
import { formatCurrency } from "@/utils";

interface Props {
  coin: any;
}

const TokenCard: React.FC<Props> = ({ coin }) => {
  const [marketCap, setMarketCap] = useState<number>(0);

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

  const { data: bnbCost }: { data: BigNumberish[] | undefined } =
    useReadContract({
      abi: config.abi,
      address: config.address as `0x${string}`,
      functionName: "getBNBAmount",
      args: [coin.token, totalSupply],
    });

  useEffect(() => {
    const usdRate = bnbFeed && Number(bnbFeed[1]) / Math.pow(10, 8);
    const result =
      bnbCost && usdRate && Number(formatEther(bnbCost[0])) * usdRate;
    setMarketCap(result as number);
  }, [bnbFeed, totalSupply, bnbCost]);
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
