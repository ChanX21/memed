import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TokenData } from "../types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemeForm } from "@/components/home/MemeForm";
import Uploady from "@rpldy/uploady";
import { useBlockNumber, useReadContract } from "wagmi";
import config from "@/config.json";
import TokenCard from "@/components/home/TokenCard";

interface DynamicComponent {
  bgColor: string;
  text: string;
}

const Home: React.FC = () => {
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const {
    data: memecoins,
    refetch,
  }: { data: TokenData[] | undefined; refetch: () => void } = useReadContract({
    abi: config.abi,
    address: config.address as `0x${string}`,
    functionName: "getTokens",
    args: ["0x0000000000000000000000000000000000000000"],
  });

  useEffect(() => {
    refetch();
  }, [blockNumber]);

  const [component1, setComponent1] = useState<DynamicComponent>({
    bgColor: "bg-gray-200",
    text: "[Address] bought BNB amount of [Token]",
  });

  const [component2, setComponent2] = useState<DynamicComponent>({
    bgColor: "bg-gray-200",
    text: "[Address] created [Token] on [Date]",
  });

  const getRandomColor = (): string =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const randomAddress = (): string =>
    `0x${Math.random().toString(36).substring(2, 10)}`;
  const randomToken = (): string => `Token-${Math.floor(Math.random() * 100)}`;
  const randomAmount = (): string => (Math.random() * 10).toFixed(2);
  const randomDate = (): string =>
    new Date(
      Date.now() - Math.floor(Math.random() * 10000000000),
    ).toLocaleDateString();

  useEffect(() => {
    const interval = setInterval(() => {
      setComponent1({
        bgColor: getRandomColor(),
        text: `${randomAddress()} bought ${randomAmount()} BNB of ${randomToken()}`,
      });
      setComponent2({
        bgColor: getRandomColor(),
        text: `${randomAddress()} created ${randomToken()} on ${randomDate()}`,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Discover Trending Memes
        </h1>
        <div className="flex w-full max-w-3xl mx-auto h-12 space-x-3 px-4">
          <Input
            type="text"
            placeholder="Search memes..."
            className="h-full border-border/40 bg-background/50 backdrop-blur focus:ring-primary"
          />
          <Button 
            type="submit" 
            variant="secondary" 
            className="h-full px-8 hover:shadow-lg transition-all duration-300"
          >
            Search
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col lg:flex-row items-center gap-5 justify-center backdrop-blur-sm bg-background/50 p-4 rounded-xl border border-border/40">
          <div
            className="p-3 rounded-lg text-sm transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: component1.bgColor,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            {component1.text}
          </div>
          <div
            className="p-3 rounded-lg text-sm transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: component2.bgColor,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            {component2.text}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-4">
          <Uploady
            multiple
            grouped
            maxGroupSize={2}
            method="PUT"
            destination={{
              url: "https://my-server",
              headers: { "x-custom": "123" },
            }}
          >
            <div className="w-full sm:w-auto">
              <MemeForm />
            </div>
          </Uploady>

          <Select defaultValue="date">
            <SelectTrigger className="w-[180px] border-border/40 bg-background/50 backdrop-blur">
              Sort By
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="date" className="cursor-pointer">
                  Latest
                </SelectItem>
                <SelectItem value="trade" className="cursor-pointer">
                  Most Traded
                </SelectItem>
                <SelectItem value="marketcap" className="cursor-pointer">
                  Market Cap
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center">
          {memecoins && memecoins.map((coin, index) => (
            <div key={index} className="w-full p-2 transition-transform duration-300 hover:scale-[1.02]">
              <TokenCard coin={coin} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
