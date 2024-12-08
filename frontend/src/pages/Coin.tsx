import React, { useState } from "react";

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
import { useReadContract } from "wagmi";
import config from "@/config.json";
import { TokenData } from "@/types";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const CoinDetailPage: React.FC = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const { toast } = useToast();
  const { data }: { data: TokenData[] | undefined } = useReadContract({
    abi: config.abi,
    address: config.address as `0x${string}`,
    functionName: "getTokens",
    args: [tokenAddress],
  });

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

  return (
    coin && (
      <div className="min-h-screen  relative">
        <div className="lg:hidden">
          <MobileForm />
        </div>
        <div className="  rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 ">
            <h1 className="text-3xl font-bold mb-2">
              {coin.name} ({coin.ticker})
            </h1>
            <div className="flex items-center mt-4">
              <span className="text-lg font-bold text-green-500 mr-4">
                $0.50
              </span>
              <span className="text-sm text-gray-500">+2.5% (24h)</span>
            </div>
          </div>
          <Separator className="my-4 border border-gray-500 w-[96%] m-auto" />
          {/* Chart Section */}
          <div className="p-6 ">
            <h2 className="text-xl font-bold mb-4">Price Chart</h2>
            <div className="grid grid-cols-7 h-[50vh] gap-10">
              <div className="bg-gray-200  h-full col-span-7 lg:col-span-5">
                <TradingViewWidget />
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
                <Card>
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
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="trades">
                <Card>
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
                    />
                  </CardContent>
                </Card>
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
