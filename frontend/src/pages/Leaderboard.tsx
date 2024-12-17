import React from "react";
import { useReadContract } from "wagmi";
import config from "@/config";
import { Loader2, Trophy, AlertCircle } from "lucide-react";
import { Address } from 'viem';
import { useBattles } from "@/hooks/useBattles";
import LeaderboardCard from "@/components/leaderboard/LeaderboardCard";
import { Button } from "@/components/ui/button";

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
  const { data: tokens, isError: isTokenError, error: tokenError, isLoading: isTokenLoading } = useReadContract({
    address: config.address as Address,
    abi: config.abi,
    functionName: "getTokens",
    args: ["0x0000000000000000000000000000000000000000"] as const,
  }) as { data: TokenData[] | undefined; isError: boolean; error: Error | null; isLoading: boolean };

  const { leaderboard, isError: isLeaderboardError, error: leaderboardError, isLoading: isLeaderboardLoading } = useLeaderboard(10);

  // Show loading state
  if (isTokenLoading || isLeaderboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show error state
  if (isTokenError || isLeaderboardError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Error Loading Leaderboard</h2>
          <p className="text-muted-foreground mb-4">
            {tokenError?.message || leaderboardError?.message || "Failed to load leaderboard data. Please try again."}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!leaderboard || !leaderboard.addresses || leaderboard.addresses.length === 0) {
    return (
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-3">Battle Champions</h1>
          <p className="text-muted-foreground">
            No battles have been completed yet. Create a battle to get started!
          </p>
        </div>
      </div>
    );
  }

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
          {leaderboard.addresses.map((token, index) => (
            <LeaderboardCard
              key={token}
              token={token}
              tokenData={tokens?.find(t => t.token === token)}
              rank={index}
              stats={{
                wins: leaderboard.wins[index],
                totalBattles: leaderboard.battles[index],
                totalVotes: leaderboard.votes[index],
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 