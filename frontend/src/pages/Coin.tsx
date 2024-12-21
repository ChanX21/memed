import React, { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CoinInfo from "@/components/coin/coinInfo";
import { Separator } from "@radix-ui/react-separator";
import { MobileForm } from "@/components/coin/forms/mobileForm";
import TradingViewWidget from "@/components/coin/TradingViewWidget";
import Thread from "@/components/coin/thread";
import { TradeForm } from "@/components/coin/forms/tradeForm";
import { useBlockNumber, useReadContract } from "wagmi";
import config from "@/config.json";
import { TokenData } from "@/types";
import { Link, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { SiBinance } from "react-icons/si";

import TokenStats from "@/components/coin/TokenStats";
import { formatEther } from "ethers";
import { truncateWalletAddress } from "@/utils";
import Trades from "@/components/coin/Trades";
import tokenAbi from "@/abi/erc20.json"; // Import the token ABI
import priceFeedAbi from "@/abi/priceFeed.json"; // Import the price feed ABI

const CoinDetailPage: React.FC = () => {
  const [tokenPrice, setTokenPrice] = useState<string>("0");
  const [marketCap, setMarketCap] = useState<string>("0");
  const [marketCapUSD, setMarketCapUSD] = useState<string>("0"); // State for market cap in USD
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const { toast } = useToast();
  const {
    data,
    refetch,
  }: { data: TokenData[] | undefined; refetch: () => void } = useReadContract({
    abi: config.abi,
    address: config.address as `0x${string}`,
    functionName: "getTokens",
    args: [tokenAddress],
  });
  // Get price for 1 token from factory
  const { data: priceData } = useReadContract({
    address: config.address as `0x${string}`,
    abi: config.abi,
    functionName: "getBNBAmount",
    args: [tokenAddress, 1], // Amount for 1 token (1 wei)
  }) as { data: bigint[] };

  // Fetch total supply for the token
  const { data: totalSupply } = useReadContract({
    abi: tokenAbi,
    address: tokenAddress as `0x${string}`,
    functionName: "totalSupply",
  });

  // Fetch BNB price in USD
  const { data: bnbFeed } = useReadContract({
    abi: priceFeedAbi,
    address: import.meta.env.VITE_BNB_FEED as `0x${string}`,
    functionName: "latestRoundData",
  });

  const { data: blockNumber } = useBlockNumber({ watch: true });
  useEffect(() => {
    refetch();
  }, [blockNumber]);
  const coin: TokenData | null = data && data[0] ? data[0] : null;
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0.5); // Example price

  const handleTabSwitch = (tab: "buy" | "sell") => setActiveTab(tab);

  const handleTrade = () => {
    if (amount > 0) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `${activeTab === "buy" ? "Bought" : "Sold"} ${amount} coins at $${price}/coin.`,
      });
      setAmount(0);
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Enter a valid amount.",
      });
    }
  };

  // Format token price in BNB
  useEffect(() => {
    try {
      if (priceData) {
        const priceInBnb = formatEther(priceData[0]); // Convert wei to BNB
        const formattedPrice = Number(priceInBnb).toFixed(6); // Format to 6 decimal places

        setTokenPrice(priceInBnb);

        // Calculate market cap
        if (totalSupply && typeof totalSupply === "bigint") {
          const totalSupplyInBnb = Number(formatEther(totalSupply)); // Convert total supply to BNB
          const calculatedMarketCap = totalSupplyInBnb * Number(formattedPrice); // Market cap calculation
          setMarketCap(calculatedMarketCap.toFixed(2)); // Format to 2 decimal places

          // Calculate market cap in USD
          if (bnbFeed && Array.isArray(bnbFeed) && bnbFeed.length > 1) {
            const bnbPriceUSD = Number(bnbFeed[1]) / Math.pow(10, 8); // Assuming bnbFeed[1] is in 8 decimal places
            const marketCapInUSD = calculatedMarketCap * bnbPriceUSD; // Market cap in USD
            setMarketCapUSD(marketCapInUSD.toFixed(2)); // Format to 2 decimal places
          }
        }
      }
    } catch (error) {
      console.error("Error calculating token price:", error);
      setTokenPrice("0");
      setMarketCap("0");
      setMarketCapUSD("0");
    }
  }, [priceData, totalSupply, bnbFeed]);

  const formatDisplayAmount = (amt: number): string | number => {
    return amt == 0 ? 0 : amt < 0.00001 ? "less than 0.00001" : amt.toFixed(4);
  };

  return (
    coin && (
      <div className="min-h-screen  relative">
        <div className="lg:hidden">
          <MobileForm />
        </div>
        <div className="  rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 ">
            <Link
              to={`https://testnet.bscscan.com/address/${tokenAddress}`}
              target="_blank"
              className=" flex items-center gap-3 hover:underline"
            >
              <SiBinance size={20} />
              <span>
                {tokenAddress ? truncateWalletAddress(tokenAddress) : ""}
              </span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">
              {coin.name} ({coin.ticker})
            </h1>
            <div className="flex items-center mt-4">
              <span className="text-lg font-bold text-green-500 mr-4">
                {formatDisplayAmount(Number(tokenPrice))} BNB
              </span>
              <span className="text-lg font-bold text-green-500 mr-4">
                Market Cap: {marketCap} BNB ({marketCapUSD} USD)
              </span>
              <span className="text-sm text-gray-500">+2.5% (24h)</span>
            </div>
          </div>
          <Separator className="my-4 border border-gray-500 w-[96%] m-auto" />
          {/* Chart Section */}
          <div className="p-6 ">
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="grid grid-cols-7 min-h-[50vh] gap-10">
              <div className="dark:bg-black/50 h-full col-span-7 lg:col-span-5  ">
                {/* <TradingViewWidget /> */}
                {/* <CustomChart /> */}

                <TokenStats />
              </div>
              <div className=" h-full hidden lg:block col-span-2 ">
                <TradeForm />
              </div>
            </div>
          </div>

          <Separator className="my-4 border border-gray-500 w-[96%] m-auto" />

          {/* Coin Details */}
          <div className="p-6 ">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="trades">Trades</TabsTrigger>
                <TabsTrigger value="thread">Thread</TabsTrigger>
              </TabsList>
              <TabsContent value="about">
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-2xl">{coin.name}</CardTitle>
                    <CardDescription className="flex gap-3">
                      <p>
                        <span>By: </span>
                        <span>
                          {`${coin.owner.slice(0, 4)}...${coin.owner.slice(-4)}`}{" "}
                        </span>
                      </p>
                      <p>
                        {formatDistanceToNow(
                          new Date(parseInt(coin.createdAt.toString()) * 1000),
                          { addSuffix: true },
                        )}
                      </p>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <CoinInfo
                      description={coin.description}
                      image={coin.image}
                      supply={coin.supply}
                      marketCapUSD={marketCapUSD}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="trades">
                <Trades />
              </TabsContent>
              <TabsContent value="thread">
                <Thread />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    )
  );
};

export default CoinDetailPage;
