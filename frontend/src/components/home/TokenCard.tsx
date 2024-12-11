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

  // Using the useReadContract hook to get the total supply of a token
  const { data: totalSupply }: { data: BigNumberish | undefined } =
    useReadContract({
      abi: tokenAbi, // The ABI of the token contract
      address: coin.token as `0x${string}`, // The token's contract address
      functionName: "totalSupply", // The function to get the total supply of the token
    });

  // Using the useReadContract hook to get the latest BNB price from the price feed
  const { data: bnbFeed }: { data: BigNumberish[] | undefined } =
    useReadContract({
      abi: priceFeedAbi, // The ABI of the price feed contract
      address: import.meta.env.VITE_BNB_FEED as `0x${string}`, // BNB price feed contract address from environment variable
      functionName: "latestRoundData", // Function to get the latest round data from the price feed
    });

  // Using the useReadContract hook to get the BNB cost based on token supply and price feed data
  const { data: bnbCost }: { data: BigNumberish[] | undefined } =
    useReadContract({
      abi: config.abi, // The ABI of the contract that handles BNB cost calculations
      address: config.address as `0x${string}`, // The contract address of the BNB cost calculation contract
      functionName: "getBNBAmount", // Function to get the BNB cost based on the total supply of the token
      args: [coin.token, totalSupply], // Arguments: token address and its total supply
    });

  // useEffect hook to calculate and update the market cap when dependencies change (bnbFeed, totalSupply, bnbCost)
  useEffect(() => {
    // If bnbFeed data exists, calculate the BNB/USD exchange rate (assuming bnbFeed[1] is the rate)
    const usdRate = bnbFeed && Number(bnbFeed[1]) / Math.pow(10, 8); // BNB price in USD (with precision adjustment)

    // If bnbCost and usdRate are available, calculate the market cap by multiplying the token's BNB cost with the USD rate
    const result =
      bnbCost && usdRate && Number(formatEther(bnbCost[0])) * usdRate; // Convert bnbCost to ether and calculate market cap

    // Update the market cap state with the calculated value
    setMarketCap(result as number); // Set the market cap state with the result
  }, [bnbFeed, totalSupply, bnbCost]); // Re-run the effect when any of these dependencies change

  return (
    <Link to={`coin/${coin.token}`}>
      <Card className=" w-[350px] h-[480px]">
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
        <CardContent className="h-[300px] w-full">
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
