import { CoinForms } from "@/components/coin/form";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CoinInfo from "@/components/coin/coinInfo";
import { Separator } from "@radix-ui/react-separator";
import { MobileForm } from "@/components/coin/mobileForm";
import TradingViewWidget from "@/components/coin/TradingViewWidget";

const CoinDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0.5); // Example price

  const handleTabSwitch = (tab: "buy" | "sell") => setActiveTab(tab);

  const handleTrade = () => {
    if (amount > 0) {
      alert(
        `${activeTab === "buy" ? "Bought" : "Sold"} ${amount} coins at $${price}/coin.`,
      );
      setAmount(0);
    } else {
      alert("Enter a valid amount.");
    }
  };

  return (
    <div className="min-h-screen  relative">
      <div className="lg:hidden">
        <MobileForm />
      </div>
      <div className="  rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 ">
          <h1 className="text-3xl font-bold mb-2">DogeCoin (DOGE)</h1>
          <p className="text-gray-600">
            The fun and friendly internet currency.
          </p>
          <div className="flex items-center mt-4">
            <span className="text-lg font-bold text-green-500 mr-4">$0.50</span>
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
              <CoinForms />
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
                  <CardTitle className="text-2xl">Dogecoin</CardTitle>
                  <CardDescription className="flex gap-3">
                    <p>
                      <span>By: </span>
                      <span>0x00 </span>
                    </p>
                    <p> 3 days ago.</p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <CoinInfo />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="trades">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Dogecoin</CardTitle>
                  <CardDescription className="flex gap-3">
                    <p>
                      <span>By: </span>
                      <span>0x00 </span>
                    </p>
                    <p> 3 days ago.</p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <CoinInfo />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="thread">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Dogecoin</CardTitle>
                  <CardDescription className="flex gap-3">
                    <p>
                      <span>By: </span>
                      <span>0x00 </span>
                    </p>
                    <p> 3 days ago.</p>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <CoinInfo />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CoinDetailPage;
