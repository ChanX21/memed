import React from "react";
import { useReadContract } from "wagmi";
import config from "@/config.json";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Medal, Star, Crown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Leaderboard: React.FC = () => {
  const { data: leaderboardData, isLoading } = useReadContract({
    abi: config.battleAbi,
    address: config.battleAddress as `0x${string}`,
    functionName: "getLeaderboard",
    args: [10],
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-primary/60" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Battle Champions</h1>
          <p className="text-muted-foreground">
            Top performing meme tokens in the battle arena
          </p>
        </div>

        <div className="space-y-4">
          {leaderboardData?.tokens.map((token: string, index: number) => (
            <Card 
              key={token} 
              className={cn(
                "hover:shadow-lg transition-all duration-300",
                index === 0 && "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20",
                index === 1 && "bg-gradient-to-r from-gray-400/10 to-transparent",
                index === 2 && "bg-gradient-to-r from-amber-600/10 to-transparent"
              )}
            >
              <CardContent className="flex items-center p-6">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                  {getRankIcon(index)}
                </div>
                
                <div className="ml-6 flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{formatAddress(token)}</h3>
                    {index === 0 && (
                      <span className="text-xs font-medium text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">
                        Champion
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-8 mt-3">
                    <div className="text-center p-2 rounded-lg bg-primary/5">
                      <p className="text-xs text-muted-foreground mb-1">Wins</p>
                      <p className="font-semibold text-primary">
                        {leaderboardData.wins[index].toString()}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-primary/5">
                      <p className="text-xs text-muted-foreground mb-1">Battles</p>
                      <p className="font-semibold text-primary">
                        {leaderboardData.totalBattles[index].toString()}
                      </p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-primary/5">
                      <p className="text-xs text-muted-foreground mb-1">Total Votes</p>
                      <p className="font-semibold text-primary">
                        {leaderboardData.totalVotes[index].toString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 