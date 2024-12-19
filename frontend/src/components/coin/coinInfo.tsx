import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Progress } from "../ui/progress";
import { BigNumberish, formatEther } from "ethers";
import { useReadContract, useReadContracts } from "wagmi";
import { useParams } from "react-router-dom";
import tokenAbi from "@/abi/erc20.json";
import { Crown, Rocket, TrendingUp, Users } from "lucide-react";
import config from "@/config.json";
import priceFeedAbi from "@/abi/priceFeed.json";
import { formatCurrency } from "@/utils";

import memedBattle from "@/abi/memedBattle.json";

interface Props {
  supply: bigint;
  description: string;
  image: string;
  marketCapUSD: string;
}
interface Holder {
  address: string;
  balance: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

type BattlePositionArray = [string[], number[], number[], number[]];

const CoinInfo: React.FC<Props> = ({ supply, description, image, marketCapUSD }) => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [percCompleted, setPercCompleted] = useState<number>(0);
  const [tokenPrice, setTokenPrice] = useState<string>("0");

  // Get price for 1 token from factory
  const { data: priceData } = useReadContract({
    address: config.address as `0x${string}`,
    abi: config.abi,
    functionName: "getBNBAmount",
    args: [tokenAddress, 1], // Amount for 1 token (18 decimals)
  }) as { data: bigint[] };

  // Using the useReadContract hook to fetch the total supply of the token
  const { data: totalSupply }: { data: BigNumberish | undefined } =
    useReadContract({
      abi: tokenAbi, // The ABI of the token contract
      address: tokenAddress as `0x${string}`, // The token contract address
      functionName: "totalSupply", // The function to get the total supply of the token
    });

  // Fetch token data including collateral from the Factory contract
  const { data: tokenData, error: tokenDataError } = useReadContract({
    abi: config.abi, // Use the Factory ABI
    address: config.address as `0x${string}`, // Factory contract address
    functionName: "tokenData", // Function to get token data
    args: [tokenAddress], // Pass the token address as an argument
  });

  // Log tokenData and any errors
  useEffect(() => {
    console.log("Token Data:", tokenData);
    if (tokenDataError) {
      console.error("Error fetching token data:", tokenDataError);
    }
  }, [tokenData, tokenDataError]);

  const {
    data: bnbFeed,
    isFetching,
    isLoading,
  } = useReadContract({
    abi: priceFeedAbi,
    address: import.meta.env.VITE_BNB_FEED as `0x${string}`,
    functionName: "latestRoundData",
  });

  const { data: kingData }: { data: BattlePositionArray | undefined } =
    useReadContract({
      abi: memedBattle.abi,
      address: memedBattle.address as `0x${string}`,
      functionName: "getLeaderboard",
      args: [10],
    });

  // Fetch graduation amount from the Factory contract
  const { data: factoryData, error: factoryDataError } = useReadContract({
    abi: config.abi, // Use the Factory ABI
    address: config.address as `0x${string}`, // Factory contract address
    functionName: "graduationAmount", // Function to get graduation amount
  });

  // Log factoryData and any errors
  useEffect(() => {
    console.log("Factory Data:", factoryData);
    if (factoryDataError) {
      console.error("Error fetching factory data:", factoryDataError);
    }
  }, [factoryData, factoryDataError]);

  // Calculate progress based on collateral and graduation amount
  const collateral = tokenData && Array.isArray(tokenData) ? tokenData[6] : 0n; // Access collateral from tokenData
  const graduationAmount = factoryData && typeof factoryData === 'bigint' ? factoryData : 1n; // Ensure factoryData is a bigint
  const progress = graduationAmount > 0n ? (collateral * 100n) / graduationAmount : 0n; // Avoid division by zero

  // Ensure progress does not exceed 100%
  const finalProgress = progress > 100n ? 100n : progress;

  function findAndDivide(array: string[], element: string) {
    // Find the position of the element in the array (starting from 1)
    const position = array.indexOf(element);

    // If the element is not found, return "0%"
    if (position === -1) {
      return 0;
    }

    // Divide the position by 10, convert to percentage, and return
    return ((10 - position) / 10) * 100;
  }

  // Format token price in BNB
  useEffect(() => {
    function handleFeed() {
      try {
        if (priceData) {
          const priceInBnb = formatEther(priceData[0]); // Convert wei to BNB

          // Define the initial supply of the token (for comparison purposes)
          const initialSupply = 200000000;

          // Convert the total supply (in wei) to ether and calculate the current supply
          const currentSupply = Number(formatEther(totalSupply || 0n));
          const actualSupply = currentSupply - initialSupply;
          const actualSupplyPrice = actualSupply * Number(priceInBnb);
          // @ts-ignore
          const usdPrice = Number(bnbFeed[1]) / Math.pow(10, 8);
          const formattedPrice = actualSupplyPrice * usdPrice;
          // console.log(formattedPrice, usdPrice, actualSupply, currentSupply);
          // Format based on price magnitude
          // let displayPrice;
          // if (formattedPrice < 0.000001) {
          //   displayPrice = formattedPrice.toExponential(2);
          // } else if (formattedPrice < 0.001) {
          //   displayPrice = formattedPrice.toFixed(6);
          // } else if (formattedPrice < 1) {
          //   displayPrice = formattedPrice.toFixed(4);
          // } else {
          //   displayPrice = formattedPrice.toFixed(2);
          // }
          setTokenPrice(formattedPrice.toString());
        }
      } catch (error) {
        console.error("Error calculating token price:", error);
        setTokenPrice("0");
      }
    }

    handleFeed();
  }, [bnbFeed, priceData, totalSupply]);

  // useEffect hook to calculate the percentage of the supply that has been minted/used
  useEffect(() => {
    // Check if totalSupply data exists, if not, return early
    if (!totalSupply) return;

    // Define the initial supply of the token (for comparison purposes)
    const initialSupply = 200000000;

    // Convert the total supply (in wei) to ether and calculate the current supply
    const currentSupply = Number(formatEther(totalSupply));

    // Calculate the percentage of the supply that has been used
    const perc = ((currentSupply - initialSupply) / currentSupply) * 100;

    // Update the state with the calculated percentage of the supply used
    setPercCompleted(perc);
  }, [totalSupply]); // Re-run the effect whenever the totalSupply value changes

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="p-6 bg-background/60 backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="col-span-1 relative group">
            {/* Image glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#050a30] via-transparent to-[#050a30] rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <img
                src={import.meta.env.VITE_REACT_APP_IPFS_GATEWAY + image}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt="Token"
              />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <p className="text-lg text-foreground/80 leading-relaxed">
              {description}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                icon={<TrendingUp className="w-4 h-4" />}
                label="Market Cap"
                value={"$ " + marketCapUSD}
              />
              {/* <StatCard
                icon={<Users className="w-4 h-4" />}
                label="Holders"
                value="1,234"
              /> */}
              {/* Add more stat cards as needed */}
            </div>         
          </div>
        </div>
      </Card>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bonding Curve Progress */}
        <Card className="p-6 bg-background/60 backdrop-blur-xl relative group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-[#050a30]/20 via-transparent to-[#050a30]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Rocket className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Bonding Curve Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    {finalProgress.toString()}% Complete
                  </p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <IoIosInformationCircleOutline className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-4 bg-card/95 backdrop-blur-xl border-border/50">
                    <p className="text-sm text-muted-foreground">
                      When the market cap reaches max threshold, all the
                      liquidity in the bonding curve will be deposited to
                      PancakeSwap and burned.
                    </p>
                    <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs font-mono text-primary">
                        Available tokens:{" "}
                        {totalSupply
                          ? (
                              Number(formatEther(totalSupply)) - 200000000
                            ).toString()
                          : "0"}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Progress
                  value={Number(finalProgress)}
                  parentBg="bg-[#050a30]/10"
                  childBg="bg-gradient-to-r from-[#050a30] to-primary"
                  className="h-4"
                />
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Start</span>
                <span className="flex items-center">
                  <img src="https://s2.coinmarketcap.com/static/img/coins/200x200/7186.png" alt="PancakeSwap" className="w-5 h-5 mr-1" />
                  PancakeSwap Launch
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* King of the Hill Progress */}
        <Card className="p-6 bg-background/60 backdrop-blur-xl relative group">
          <div className="absolute -inset-[1px] bg-gradient-to-r from-[#050a30]/20 via-transparent to-[#050a30]/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold">King of the Hill</h3>
                  <p className="text-sm text-muted-foreground">
                    {kingData
                      ? findAndDivide(kingData[0], tokenAddress as string)
                      : 0}
                    % Progress
                  </p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <IoIosInformationCircleOutline className="w-5 h-5 text-muted-foreground hover:text-yellow-500 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-4 bg-card/95 backdrop-blur-xl border-border/50">
                    <p className="text-sm text-muted-foreground">
                      The most victorious and celebrated coins rise above all
                      others, claiming the ultimate title as the undisputed King
                      of the Hills, reigning supreme at the peak of triumph and
                      dominance.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Progress
              value={
                kingData
                  ? findAndDivide(kingData[0], tokenAddress as string)
                  : 0
              }
              parentBg="bg-yellow-500/20"
              childBg="bg-gradient-to-r from-yellow-500 to-yellow-300"
              className="h-4"
            />

            {/* <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">
                  Crowned king on 12/3/2024, 11:38:09 AM
                </span>
              </div>
            </div> */}
          </div>
        </Card>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className="p-4 rounded-xl bg-background/40 backdrop-blur border border-border/50">
    <div className="flex items-center gap-2 mb-2">
      <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

export default CoinInfo;
