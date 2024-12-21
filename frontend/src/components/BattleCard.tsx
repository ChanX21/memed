import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trophy, Timer, TrendingUp, Users, Award } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { formatAddress, formatTokenAmount } from "@/lib/utils";

interface TokenInfo {
  token: `0x${string}`;
  name: string;
  ticker: string;
  description: string;
  image: string;
  supply: bigint;
}

interface BattleCardProps {
  battle: {
    id: bigint;
    token1: `0x${string}`;
    token2: `0x${string}`;
    token1Votes: bigint;
    token2Votes: bigint;
    startTime: bigint;
    endTime: bigint;
    settled: boolean;
    winner?: `0x${string}`;
  };
  tokens: TokenInfo[];
  onVote: (battleId: bigint, votingFor: string) => Promise<void>;
  onSettle: (battleId: bigint) => Promise<void>;
  isVoting: bigint | null;
  isSettling: bigint | null;
}

export const BattleCard: React.FC<BattleCardProps> = ({
  battle,
  tokens,
  onVote,
  onSettle,
  isVoting,
  isSettling,
}) => {
  const timeLeft = useCountdown(battle.endTime);
  const canSettle =
    !battle.settled && battle.endTime <= BigInt(Math.floor(Date.now() / 1000));

  const calculateProgressValue = (
    token1Votes: bigint,
    token2Votes: bigint,
  ): number => {
    try {
      if (token1Votes === BigInt(0) && token2Votes === BigInt(0)) return 50;
      const total = token1Votes + token2Votes;
      if (total === BigInt(0)) return 50;
      return (
        Number((token1Votes * BigInt(100)).toString()) /
        Number(total.toString())
      );
    } catch (error) {
      console.error("Error calculating progress:", error);
      return 50;
    }
  };

  const token1 = tokens?.find((t) => t.token === battle.token1);
  const token2 = tokens?.find((t) => t.token === battle.token2);
  const progressValue = calculateProgressValue(
    battle.token1Votes,
    battle.token2Votes,
  );

  const formatTime = (time: number) => time.toString().padStart(2, "0");

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Battle #{battle.id.toString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            {timeLeft.total > 0 ? (
              <>
                <Timer className="w-4 h-4" />
                <span className="font-mono">
                  {timeLeft.hours > 0 && `${formatTime(timeLeft.hours)}:`}
                  {formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
                </span>
              </>
            ) : (
              <Badge variant={battle.settled ? "secondary" : "destructive"}>
                {battle.settled ? "Settled" : "Ready to Settle"}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Token Stats */}
          <div className="grid grid-cols-3 gap-4">
            {/* Token 1 Stats */}
            <div className="col-span-1 space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="text-sm">
                      <p className="font-medium truncate">
                        {token1?.name || formatAddress(battle.token1)}
                      </p>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>
                          {(Number(battle.token1Votes) / 10 ** 9).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Supply:{" "}
                      {token1 ? formatTokenAmount(token1.supply) : "N/A"}
                    </p>
                    <p>Address: {formatAddress(battle.token1)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Battle Progress */}
            <div className="col-span-1 flex items-center justify-center">
              <div className="w-full space-y-2">
                <Progress value={progressValue} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {progressValue.toFixed(1)}% -{" "}
                  {(100 - progressValue).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Token 2 Stats */}
            <div className="col-span-1 space-y-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="text-sm text-right">
                      <p className="font-medium truncate">
                        {token2?.name || formatAddress(battle.token2)}
                      </p>
                      <div className="flex items-center justify-end gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>
                          {" "}
                          {(Number(battle.token2Votes) / 10 ** 9).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Supply:{" "}
                      {token2 ? formatTokenAmount(token2.supply) : "N/A"}
                    </p>
                    <p>Address: {formatAddress(battle.token2)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Battle Actions */}
          {!battle.settled && (
            <div className="space-y-3">
              {timeLeft.total > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => onVote(battle.id, battle.token1)}
                          disabled={isVoting === battle.id}
                          variant="outline"
                          className="w-full"
                        >
                          {isVoting === battle.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Vote for{" "}
                              {token1?.name || formatAddress(battle.token1)}
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Click to vote for{" "}
                          {token1?.name || formatAddress(battle.token1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Must hold tokens to vote
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => onVote(battle.id, battle.token2)}
                          disabled={isVoting === battle.id}
                          variant="outline"
                          className="w-full"
                        >
                          {isVoting === battle.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Vote for{" "}
                              {token2?.name || formatAddress(battle.token2)}
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Click to vote for{" "}
                          {token2?.name || formatAddress(battle.token2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Must hold tokens to vote
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              {canSettle && (
                <Button
                  onClick={() => onSettle(battle.id)}
                  disabled={isSettling === battle.id}
                  variant="secondary"
                  className="w-full"
                >
                  {isSettling === battle.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Settling Battle...
                    </>
                  ) : (
                    <>
                      <Trophy className="mr-2 h-4 w-4" />
                      Settle Battle
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Winner Display */}
          {battle.settled && battle.winner && (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Award className="w-5 h-5" />
              <span className="font-medium">
                Winner:{" "}
                {tokens?.find((t) => t.token === battle.winner)?.name ||
                  formatAddress(battle.winner)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
