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

const DEFAULT_LOGO = "/assets/logotrnspt.png";

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
      <Card className="w-[350px] h-[480px] relative group transition-all duration-500 hover:scale-[1.02]">
        {/* Magical dark glow effects */}
        <div className="absolute -inset-[2px] bg-[#dfe6f7] opacity-0 group-hover:opacity-30 rounded-[24px] blur-sm transition-all duration-1200" />

        {/* Softer layered glows for depth */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#e6ecfa] via-[#f0f4fc] to-[#e6ecfa] rounded-[22px] opacity-0 group-hover:opacity-20 blur-md transition-all duration-1200" />

        {/* Inner glow ring */}
        <div className="absolute inset-[0.5px] rounded-[21px] bg-gradient-to-b from-[#f5f8fd]/40 via-transparent to-[#f5f8fd]/40 opacity-0 group-hover:opacity-15 blur-xs transition-all duration-1000" />

        {/* Animated corner glows */}
        {/* <div className="absolute -inset-[3px] opacity-0 group-hover:opacity-60 transition-all duration-700">
          <div className="absolute top-[2px] left-[2px] w-20 h-20 bg-[#050a30] blur-xl rounded-full animate-pulse-slow" />
          <div className="absolute bottom-[2px] right-[2px] w-20 h-20 bg-[#050a30] blur-xl rounded-full animate-pulse-slow delay-300" />
        </div> */}

        {/* Main content container with dark overlay */}
        <div className="relative h-full rounded-xl bg-card/95 overflow-hidden flex flex-col backdrop-blur-sm">
          {/* Header section */}
          <CardHeader className="p-4">
            <CardTitle className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 backdrop-blur">
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
                  <p className="font-mono text-xs text-primary/90">
                    {`${coin.owner.slice(0, 4)}...${coin.owner.slice(-4)}`}
                  </p>
                </div>
              </div>

              <time className="text-xs text-muted-foreground font-medium">
                {formatDistanceToNow(
                  new Date(parseInt(coin.createdAt.toString()) * 1000),
                  { addSuffix: true },
                )}
              </time>
            </CardTitle>
          </CardHeader>

          {/* Image container */}
          <CardContent className="relative p-0 h-[280px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-transparent to-background/20 z-10" />
            <img
              src={
                coin.image
                  ? `${import.meta.env.VITE_REACT_APP_IPFS_GATEWAY}${coin.image}`
                  : DEFAULT_LOGO
              }
              alt={coin.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = DEFAULT_LOGO;
              }}
            />
          </CardContent>

          {/* Details section */}
          <div className="flex-1 flex flex-col p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-semibold tracking-tight text-foreground/90">
                {coin.name}
              </h3>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10">
                <span className="font-mono text-sm font-medium text-primary">
                  {formatCurrency(marketCap)}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {coin.description}
              {coin.description.length > 100 && (
                <button className="inline-flex items-center gap-1 text-primary hover:underline ml-1 font-medium">
                  More
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </p>
          </div>

          {/* Footer with gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
        </div>
      </Card>
    </Link>
  );
};

export default TokenCard;
