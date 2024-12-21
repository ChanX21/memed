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
import {
  useBlockNumber,
  usePublicClient,
  useReadContract,
  useWatchContractEvent,
} from "wagmi";
import config from "@/config.json";
import TokenCard from "@/components/home/TokenCard";
import TypewriterText from "@/components/ui/TypewriterText";
import { BigNumberish, formatEther } from "ethers";
import { truncateWalletAddress } from "@/utils";
import tokenAbi from "@/abi/erc20.json";
import eventsAbi from "@/abi/events.json";
import { AbiEvent, decodeEventLog } from "viem";

interface DynamicComponent {
  bgColor: string;
  text: string;
}

interface DecodedLog {
  args: {
    amount: BigNumberish;
    buyer: string;
    token: string;
    totalPrice: BigNumberish;
    timestamp: number;
  };
}

interface TokenCreatedLog {
  args: {
    owner: string;
    token: string;
    name: string;
    ticker: string;
    image: string;
    description: string;
    totalPrice: BigNumberish;
    createdAt: number;
  };
}

const Home: React.FC = () => {
  const [log, setLog] = useState<DecodedLog | null>(null);
  const [tokenLog, setTokenLog] = useState<TokenCreatedLog | null>(null);
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const publicClient = usePublicClient();
  const {
    data: memecoins,
    refetch,
  }: { data: TokenData[] | undefined; refetch: () => void } = useReadContract({
    abi: config.abi,
    address: config.address as `0x${string}`,
    functionName: "getTokens",
    args: ["0x0000000000000000000000000000000000000000"],
  });

  const sortedMemecoins = React.useMemo(() => {
    if (!memecoins) return [];
    return [...memecoins].sort(
      (a, b) => Number(b.createdAt) - Number(a.createdAt),
    );
  }, [memecoins]);

  const getRandomColor = (): string =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const randomAddress = (): string => {
    const addresses = [
      "0x7Ef2...3A4d",
      "0x8Dc4...5B2e",
      "0x9Fa1...2C8f",
      "0x6Bb8...9D1a",
      "0x5Ae3...4F7b",
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  };

  const randomToken = (): string => {
    const tokens = ["PEPE", "DOGE", "WOJAK", "MOON", "FROG", "CAT", "MEME"];
    return tokens[Math.floor(Math.random() * tokens.length)];
  };

  const randomAmount = (): string => {
    return (Math.random() * 2.5 + 0.01).toFixed(3);
  };

  const randomDate = (): string =>
    new Date(
      Date.now() - Math.floor(Math.random() * 10000000000),
    ).toLocaleDateString();

  const [component1, setComponent1] = useState<DynamicComponent>({
    bgColor: "bg-gray-200",
    text: `${randomAddress()} bought ${randomAmount()} of $${randomToken()}`,
  });

  const [component2, setComponent2] = useState<DynamicComponent>({
    bgColor: "bg-gray-200",
    text: `${randomAddress()} created $${randomToken()} on ${randomDate()}`,
  });

  useEffect(() => {
    refetch();
  }, [blockNumber]);

  useEffect(() => {
    const interval = setInterval(() => {
      setComponent1({
        bgColor: getRandomColor(),
        text: `${randomAddress()} bought ${randomAmount()} of $${randomToken()}`,
      });
      setComponent2({
        bgColor: getRandomColor(),
        text: `${randomAddress()} created $${randomToken()} on ${randomDate()}`,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const pitchTexts = [
    "Welcome to the future of memes... 🌟",
    "Create your own token in seconds... 🚀",
    "Battle for meme supremacy... ⚔️",
    "Vote and earn rewards... 💎",
    "Join our meme community... 🤝",
    "Build your meme empire... 👑",
    "Where memes meet DeFi... 💫",
    "Your meme journey starts here... ✨",
  ];

  // Fetch token name for the specified address
  const { data: tokenName } = useReadContract({
    abi: tokenAbi, // Token contract ABI typed as Abi
    address: log?.args.token as `0x${string}`, // Token contract address
    functionName: "name", // Function to get the token name
  });
  // Fetch token name for the specified address
  const { data: createdTokenName } = useReadContract({
    abi: tokenAbi, // Token contract ABI typed as Abi
    address: tokenLog?.args.token as `0x${string}`, // Token contract address
    functionName: "name", // Function to get the token name
  });

  //watch buy event
  useWatchContractEvent({
    address: config.address as `0x${string}`,
    abi: config.abi,
    eventName: "TokensBought",
    onLogs(logs) {
      console.log("New logs!", logs);
      //@ts-ignore
      setLog(logs[0]);
    },
  });

  //fetch buy logs
  const deploymentBlock = 46680516n; // Deployment block number

  const fetchBuyLogs = async () => {
    try {
      const batchSize = 50000n; // Define the maximum block range
      const latestBlock = await publicClient?.getBlockNumber(); // Fetch the latest block number
      const logs: any[] = [];

      for (
        let startBlock = deploymentBlock;
        // @ts-ignore
        startBlock <= latestBlock;
        startBlock += batchSize
      ) {
        const endBlock =
          // @ts-ignore
          startBlock + batchSize - 1n > latestBlock
            ? latestBlock
            : startBlock + batchSize - 1n;

        // Fetch logs in batches
        const batchLogs = await publicClient?.getLogs({
          address: config.address as `0x${string}`,
          event: eventsAbi.tokensBought as AbiEvent,
          fromBlock: startBlock,
          toBlock: endBlock,
          args: {
            token: log?.args.token, // Filter by indexed argument
          },
        });
        // @ts-ignore
        logs.push(...batchLogs); // Add batch logs to the result
      }

      // Decode logs
      const decodedLogs = logs.map((log) =>
        decodeEventLog({
          abi: [eventsAbi.tokensBought],
          data: log.data,
          topics: log.topics,
        }),
      );

      if (decodedLogs.length > 0) {
        //@ts-ignore
        setLog(decodedLogs[0]); // Set the first decoded log
      }
    } catch (error) {
      console.error("Error fetching buy logs:", error);
    }
  };

  //watch token creation event
  useWatchContractEvent({
    address: config.address as `0x${string}`,
    abi: config.abi,
    eventName: "TokenCreated",
    onLogs(logs) {
      console.log("New logs!", logs);
      //@ts-ignore
      setTokenLog(logs[0]);
    },
  });

  //fetch token creation logs

  const fetchTokenCreationLogs = async () => {
    try {
      const batchSize = 50000n; // Define the maximum block range
      const latestBlock = await publicClient?.getBlockNumber(); // Fetch the latest block number
      const logs: any[] = [];

      for (
        let startBlock = deploymentBlock;
        // @ts-ignore
        startBlock <= latestBlock;
        startBlock += batchSize
      ) {
        const endBlock =
          // @ts-ignore
          startBlock + batchSize - 1n > latestBlock
            ? latestBlock
            : startBlock + batchSize - 1n;

        // Fetch logs in batches
        const batchLogs = await publicClient?.getLogs({
          address: config.address as `0x${string}`,
          event: eventsAbi.tokenCreated as AbiEvent,
          fromBlock: startBlock,
          toBlock: endBlock,
        });

        logs.push(...batchLogs); // Add batch logs to the result
      }

      // Decode logs
      const decodedLogs = logs.map((log) =>
        decodeEventLog({
          abi: [eventsAbi.tokenCreated], // Pass the ABI array
          data: log.data,
          topics: log.topics,
        }),
      );

      if (decodedLogs.length > 0) {
        //@ts-ignore
        setTokenLog(decodedLogs[0]); // Set the first decoded log
      }
    } catch (error) {
      console.error("Error fetching token creation logs:", error);
    }
  };

  useEffect(() => {
    fetchBuyLogs();
    fetchTokenCreationLogs();
  }, [publicClient]);

  function formatTimestamp(timestamp: number) {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Discover Trending Memes
        </h1>

        <div className="max-w-2xl mx-auto mb-8">
          <TypewriterText
            texts={pitchTexts}
            typingSpeed={80}
            deletingSpeed={40}
            pauseTime={1500}
          />
        </div>

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
                       hover:shadow-[0_0_15px_rgba(5,10,48,0.25)]
                       transition-all duration-300"
            />
            <Button
              type="submit"
              variant="secondary"
              className="h-12 px-8 bg-primary text-primary-foreground
                         hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(5,10,48,0.5)]
                         shadow-md transition-all duration-300
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
                <div className="flex-1 overflow-x-auto">
                  <p className="text-sm font-medium text-foreground">
                    <span className="font-mono text-primary">
                      {truncateWalletAddress(log?.args.buyer || "")}
                    </span>
                    <span className="mx-1">bought</span>
                    <span className="font-semibold text-primary">
                      {formatEther(log?.args.amount || 0n)}
                    </span>
                    <span className="mx-1">of</span>
                    <span className="font-medium text-primary whitespace-nowrap">
                      {/* @ts-ignore */}
                      {tokenName}
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
                <div className="flex-1 overflow-x-auto">
                  <p className="text-sm font-medium text-foreground">
                    <span className="font-mono text-primary">
                      {truncateWalletAddress(tokenLog?.args.owner || "")}
                    </span>
                    <span className="mx-1">created</span>
                    <span className="font-medium text-primary">
                      {/* @ts-ignore */}
                      {createdTokenName}
                    </span>
                    <span className="mx-1">on</span>
                    <span className="font-medium">
                      {formatTimestamp(Number(tokenLog?.args.createdAt || 0))}
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
          {sortedMemecoins &&
            sortedMemecoins.map((coin, index) => (
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
