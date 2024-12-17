import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Star, Crown, Swords, Users, TrendingUp, ChevronDown, ChevronUp, Coins, Calendar, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatAddress, formatTokenAmount } from "@/lib/utils";
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

interface LeaderboardCardProps {
  token: `0x${string}`;
  tokenData?: TokenData;
  rank: number;
  stats: {
    wins: bigint;
    totalBattles: bigint;
    totalVotes: bigint;
  };
}

const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  token,
  tokenData,
  rank,
  stats,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getWinRate = (wins: bigint, totalBattles: bigint): string => {
    if (totalBattles === 0n) return "0%";
    const rate = (Number(wins) / Number(totalBattles)) * 100;
    return `${rate.toFixed(1)}%`;
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

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return "Champion";
      case 1:
        return "Runner-up";
      case 2:
        return "Third Place";
      default:
        return `Rank #${rank + 1}`;
    }
  };

  const winRate = getWinRate(stats.wins, stats.totalBattles);
  const averageVotes = stats.totalBattles === 0n 
    ? "0" 
    : (Number(stats.totalVotes) / Number(stats.totalBattles)).toFixed(1);

  return (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-300",
        rank === 0 && "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20",
        rank === 1 && "bg-gradient-to-r from-gray-400/10 to-transparent",
        rank === 2 && "bg-gradient-to-r from-amber-600/10 to-transparent"
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
            {getRankIcon(rank)}
          </div>
          
          <div className="ml-6 flex-grow">
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <h3 className="font-semibold">
                      {tokenData?.name || formatAddress(token)}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Address: {formatAddress(token)}</p>
                    {tokenData && (
                      <>
                        <p>Ticker: {tokenData.ticker}</p>
                        <p>Description: {tokenData.description}</p>
                      </>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                rank === 0 && "text-yellow-500 bg-yellow-500/10",
                rank === 1 && "text-gray-400 bg-gray-400/10",
                rank === 2 && "text-amber-600 bg-amber-600/10",
                rank > 2 && "text-primary bg-primary/10"
              )}>
                {getRankBadge(rank)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div className="text-center p-2 rounded-lg bg-primary/5">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Trophy className="w-3 h-3" />
                  <span>Wins</span>
                </div>
                <p className="font-semibold text-primary">
                  {stats.wins.toString()}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-primary/5">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Swords className="w-3 h-3" />
                  <span>Battles</span>
                </div>
                <p className="font-semibold text-primary">
                  {stats.totalBattles.toString()}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-primary/5">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <Users className="w-3 h-3" />
                  <span>Avg. Votes</span>
                </div>
                <p className="font-semibold text-primary">{averageVotes}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-primary/5">
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Win Rate</span>
                </div>
                <p className="font-semibold text-primary">{winRate}</p>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="ml-4"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Expanded Token Details */}
        {isExpanded && tokenData && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Supply</p>
                  <p className="font-medium">{formatTokenAmount(tokenData.supply)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">
                    {new Date(tokenData.createdAt * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Stage</p>
                  <p className="font-medium">
                    {tokenData.stage === 2 ? "Graduated" : "In Progress"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="text-sm mt-1">{tokenData.description}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard; 