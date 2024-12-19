import React, { useEffect, useState } from "react";
import { BigNumberish, formatEther } from "ethers";
import { useReadContract } from "wagmi";
import { Link } from "react-router-dom";
import tokenAbi from "@/abi/erc20.json";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import config from "@/config.json";
import { formatDistanceToNow } from "date-fns";
import priceFeedAbi from "@/abi/priceFeed.json";
import { formatCurrency } from "@/utils";

interface Props {
  coin: {
    token: string;
    name: string;
    ticker: string;
    description: string;
    image: string;
    owner: string;
    createdAt: number;
    supply: bigint;
    collateral: bigint;
    stage: number;
  };
}

const DEFAULT_LOGO = "/assets/logotrnspt.png";

const TokenCard: React.FC<Props> = ({ coin }) => {
  const [tokenPrice, setTokenPrice] = useState<string>("0");

  // Get price for 1 token from factory in wei
  const { data: priceData } = useReadContract({
    address: config.address as `0x${string}`,
    abi: config.abi,
    functionName: "getBNBAmount",
    args: [coin.token, 1], // Amount for 1 token (1 wei)
  }) as { data: bigint[] };

  // Fetch token decimals for the specified address
  const { data: tokenDecimals } = useReadContract({
    abi: tokenAbi,
    address: coin.token as `0x${string}`,
    functionName: "decimals",
  });

  // Format token price in wei
  useEffect(() => {
    try {
      if (priceData && tokenDecimals) {
        const priceInWei = priceData[0]; // Price in wei
        const priceInBnb = formatEther(priceInWei); // Convert wei to BNB
        const adjustedPrice = Number(priceInBnb); // Adjust for decimals if necessary

        // Format the price to 6 decimal places
        const formattedPrice = adjustedPrice.toFixed(6); // 6 decimal places

        setTokenPrice(formattedPrice);
      }
    } catch (error) {
      console.error("Error calculating token price:", error);
      setTokenPrice("0");
    }
  }, [priceData, tokenDecimals]);

  // Format addresses to always show 0x prefix
  const formattedOwnerAddress = coin.owner.startsWith('0x') ? coin.owner : `0x${coin.owner}`;
  const formattedTokenAddress = coin.token.startsWith('0x') ? coin.token : `0x${coin.token}`;

  // Format creation time safely
  const formattedTime = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(Number(coin.createdAt) * 1000), {
        addSuffix: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "recently";
    }
  }, [coin.createdAt]);

  // Format supply to be more readable
  const formattedSupply = React.useMemo(() => {
    try {
      const supplyInEther = Number(formatEther(coin.supply.toString()));
      if (supplyInEther >= 1_000_000) {
        return `${(supplyInEther / 1_000_000).toFixed(2)}M`;
      } else if (supplyInEther >= 1_000) {
        return `${(supplyInEther / 1_000).toFixed(2)}K`;
      }
      return supplyInEther.toFixed(2);
    } catch (error) {
      return "0";
    }
  }, [coin.supply]);

  return (
    <Link to={`coin/${formattedTokenAddress}`}>
      <Card className="w-[350px] h-[480px] relative group transition-all duration-500 hover:scale-[1.02]">
        {/* Magical dark glow effects */}
        <div className="absolute -inset-[2px] bg-[#dfe6f7] opacity-0 group-hover:opacity-30 rounded-[24px] blur-sm transition-all duration-1200" />

        {/* Softer layered glows for depth */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-[#e6ecfa] via-[#f0f4fc] to-[#e6ecfa] rounded-[22px] opacity-0 group-hover:opacity-20 blur-md transition-all duration-1200" />

        {/* Inner glow ring */}
        <div className="absolute inset-[0.5px] rounded-[21px] bg-gradient-to-b from-[#f5f8fd]/40 via-transparent to-[#f5f8fd]/40 opacity-0 group-hover:opacity-15 blur-xs transition-all duration-1000" />

        {/* Main content container with dark overlay */}
        <div className="relative h-full rounded-xl bg-card/95 overflow-hidden flex flex-col backdrop-blur-sm">
          {/* Header section */}
          <CardHeader className="p-4">
            <CardTitle className="flex justify-between items-start text-sm">
              <div className="flex flex-col gap-2">
                {/* Owner Address */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 backdrop-blur">
                    <span className="text-xs text-muted-foreground">creator</span>
                    <span className="w-1 h-1 rounded-full bg-primary/60" />
                    <p className="font-mono text-xs text-primary/90">
                      {`${formattedOwnerAddress.slice(0, 6)}...${formattedOwnerAddress.slice(-4)}`}
                    </p>
                  </div>
                </div>
                
                {/* Token Address - only shown on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex items-center gap-1.5 px-2 py-0.5">
                    <span className="text-xs text-muted-foreground">Token Address</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    <p className="font-mono text-xs text-muted-foreground/70">
                      {`${formattedTokenAddress.slice(0, 6)}...${formattedTokenAddress.slice(-4)}`}
                    </p>
                  </div>
                </div>
              </div>

              <time className="text-xs text-muted-foreground font-medium">
                {formattedTime}
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
              <div>
                <h3 className="font-display text-lg font-semibold tracking-tight text-foreground/90">
                  {coin.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground font-mono">
                    ${coin.ticker}
                  </p>
                  <span className="text-xs text-muted-foreground/70">•</span>
                  <p className="text-xs text-muted-foreground/70">
                    Supply: {formattedSupply}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10">
                <span className="font-mono text-sm font-medium text-primary">
                  {tokenPrice} BNB
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
