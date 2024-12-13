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
import { useReadContract } from "wagmi";
import { useParams } from "react-router-dom";
import tokenAbi from "@/abi/erc20.json";
import { Crown, Rocket, TrendingUp, Users } from "lucide-react";

interface Props {
  supply: bigint;
  description: string;
  image: string;
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

const CoinInfo: React.FC<Props> = ({ supply, description, image }) => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [percCompleted, setPercCompleted] = useState<number>(0);

  // const { isPending, error, data, refetch } = useQuery({
  //   queryKey: ["tokenHoldersList"],
  //   queryFn: () =>
  //     fetch(
  //       `https://api.etherscan.io/api?module=token&action=tokenholderlist&contractaddress=${tokenAddress}&page=1&offset=10&apikey=${import.meta.env.VITE_ETHERSCAN_API_KEY}`,
  //     ).then((res) => res.json()),
  //   refetchInterval: 500,
  //   refetchOnWindowFocus: true,
  // });

  // Using the useReadContract hook to fetch the total supply of the token
  const { data: totalSupply }: { data: BigNumberish | undefined } =
    useReadContract({
      abi: tokenAbi, // The ABI of the token contract
      address: tokenAddress as `0x${string}`, // The token contract address
      functionName: "totalSupply", // The function to get the total supply of the token
    });

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
            <p className="text-lg text-foreground/80 leading-relaxed">{description}</p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<TrendingUp className="w-4 h-4" />}
                label="Market Cap"
                value="$21,000"
              />
              <StatCard
                icon={<Users className="w-4 h-4" />}
                label="Holders"
                value="1,234"
              />
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
                    {percCompleted.toFixed(1)}% Complete
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
                      When the market cap reaches $21,000 (~30 BNB), all the liquidity 
                      in the bonding curve will be deposited to PancakeSwap and burned.
                    </p>
                    <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs font-mono text-primary">
                        Available tokens: {(1_000_000_000n - supply).toString()}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <Progress 
                  value={percCompleted} 
                  parentBg="bg-[#050a30]/10"
                  childBg="bg-gradient-to-r from-[#050a30] to-primary"
                  className="h-4"
                />
                {/* Milestone markers */}
                <div className="absolute -top-1 left-[30%] h-6 w-[2px] bg-primary/30" />
                <div className="absolute -top-1 left-[60%] h-6 w-[2px] bg-primary/30" />
              </div>
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Start</span>
                <span>PancakeSwap Launch</span>
                <span>Complete</span>
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
                  <p className="text-sm text-muted-foreground">33% Progress</p>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <IoIosInformationCircleOutline className="w-5 h-5 text-muted-foreground hover:text-yellow-500 transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-4 bg-card/95 backdrop-blur-xl border-border/50">
                    <p className="text-sm text-muted-foreground">
                      When the market cap reaches $46,094, this coin will be pinned 
                      to the top of the feed until dethroned!
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Progress 
              value={33} 
              parentBg="bg-yellow-500/20"
              childBg="bg-gradient-to-r from-yellow-500 to-yellow-300"
              className="h-4"
            />

            <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Crowned king on 12/3/2024, 11:38:09 AM</span>
              </div>
            </div>
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
      <div className="p-2 rounded-lg bg-primary/10">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

export default CoinInfo;
