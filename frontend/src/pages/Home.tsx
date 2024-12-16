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
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Discover Trending Memes
        </h1>

        <div className="relative max-w-3xl mx-auto px-4">
          <div className="absolute inset-0 -top-4 -bottom-4 bg-gradient-to-r from-primary/10 via-background to-primary/10 blur-xl" />

          <div className="relative flex gap-3 p-2 bg-background/40 backdrop-blur-md rounded-xl border border-border/40 shadow-lg">
            <Input
              type="text"
              placeholder="Search memes..."
              className="h-12 flex-1 bg-background/60 border-border/30 rounded-lg
                       text-foreground placeholder:text-muted-foreground
                       focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                       hover:bg-background/80 hover:border-primary/50
                       transition-all duration-300"
            />
            <Button
              type="submit"
              variant="secondary"
              className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90
                       shadow-md hover:shadow-lg transition-all duration-300
                       hover:scale-105 active:scale-95"
            >
              <span className="mr-2">Search</span>
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col lg:flex-row items-center gap-5 justify-center">
          <div className="w-full lg:w-auto">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />

              <div
                className="relative flex items-center gap-3 p-4 rounded-xl backdrop-blur-md bg-background/80 border border-border/40 shadow-lg transition-all duration-300 hover:scale-[1.02]"
                style={{
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Transaction Icon */}
                <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>

                {/* Transaction Text */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    <span className="font-mono text-primary">
                      {component1.text.match(/0x[a-z0-9]+/)?.[0] || ""}
                    </span>
                    <span className="mx-1">bought</span>
                    <span className="font-semibold text-primary">
                      {component1.text.match(/\d+\.?\d*/)?.[0] || ""} BNB
                    </span>
                    <span className="mx-1">of</span>
                    <span className="font-medium text-primary">
                      {component1.text.match(/Token-\d+/)?.[0] || ""}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />

              <div
                className="relative flex items-center gap-3 p-4 rounded-xl backdrop-blur-md bg-background/80 border border-border/40 shadow-lg transition-all duration-300 hover:scale-[1.02]"
                style={{
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Creation Icon */}
                <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>

                {/* Creation Text */}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    <span className="font-mono text-primary">
                      {component2.text.split(" ")[0]}
                    </span>
                    <span className="mx-1">created</span>
                    <span className="font-medium text-primary">
                      {component2.text.split(" ")[2]}
                    </span>
                    <span className="mx-1">on</span>
                    <span className="font-medium">
                      {component2.text.split(" ")[4]}
                    </span>
                  </p>
                </div>
              </div>
            </div>
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

      <div className=" mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 place-items-center">
          {memecoins &&
            memecoins.map((coin, index) => (
              <div
                key={index}
                className="w-full p-3 transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="flex justify-center">
                  <TokenCard coin={coin} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
