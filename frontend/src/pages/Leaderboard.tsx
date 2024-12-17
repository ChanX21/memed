import React, { useEffect } from "react";
import { useReadContract } from "wagmi";
import config from "@/config";
import { Loader2, Trophy } from "lucide-react";
import { Address } from 'viem';
import { useBattles } from "@/hooks/useBattles";
import LeaderboardCard from "@/components/leaderboard/LeaderboardCard";

interface TokenData {
  token: `0x${string}`;
  name: string;
  ticker: string;
  description: string;
  image: string;
  supply: bigint;
  owner: `0x${string}`;
  stage: number;
  collateral: bigint;
  createdAt: number;
}

const Leaderboard: React.FC = () => {
  const { useLeaderboard } = useBattles();
  const { data: tokens } = useReadContract({
    address: config.address as Address,
    abi: config.abi,
    functionName: "getTokens",
    args: ["0x0000000000000000000000000000000000000000"] as const,
  }) as { data: TokenData[] | undefined };

  const { data: rawLeaderboardData, isLoading, error } = useLeaderboard(10);

  useEffect(() => {
    console.log('Raw leaderboard data:', rawLeaderboardData);
    console.log('Tokens:', tokens);
    console.log('Loading:', isLoading);
    console.log('Error:', error);
  }, [rawLeaderboardData, tokens, isLoading, error]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!rawLeaderboardData || !rawLeaderboardData[0] || rawLeaderboardData[0].length === 0) {
    console.log('No leaderboard data available');
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">Battle Champions</h1>
          <p className="text-muted-foreground">
            No battles have been completed yet. Create a battle to get started!
          </p>
        </div>
      </div>
    );
  }

  const [tokenAddresses, wins, totalBattles, totalVotes] = rawLeaderboardData;

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Battle Champions
          </h1>
          <p className="text-muted-foreground mb-8">
            Top performing meme tokens in the battle arena
          </p>
        </div>

        <div className="space-y-4">
          {tokenAddresses.map((token, index) => {
            console.log('Rendering token:', token, 'at index:', index);
            console.log('Token data:', tokens?.find(t => t.token === token));
            console.log('Stats:', {
              wins: wins[index],
              totalBattles: totalBattles[index],
              totalVotes: totalVotes[index],
            });
            
            return (
              <LeaderboardCard
                key={token}
                token={token}
                tokenData={tokens?.find(t => t.token === token)}
                rank={index}
                stats={{
                  wins: wins[index],
                  totalBattles: totalBattles[index],
                  totalVotes: totalVotes[index],
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 