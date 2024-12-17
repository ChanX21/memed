import React, { useState, useEffect } from "react";
import { useReadContract, useWriteContract, useAccount } from "wagmi";
import config from "@/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Swords, Timer, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useBattles } from '@/hooks/useBattles';
import { Address } from 'viem';
import { parseEther } from "viem";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BattleCard } from '@/components/BattleCard';
import { formatAddress, formatTokenAmount } from '@/lib/utils';

interface TokenData {
  token: `0x${string}`;
  name: string;
  ticker: string;
  description: string;
  image: string;
  owner: `0x${string}`;
  stage: number;
  collateral: bigint;
  supply: bigint;
  createdAt: number;
}

interface BattleData {
  battleIds: bigint[];
  token1Addresses: `0x${string}`[];
  token2Addresses: `0x${string}`[];
  token1Votes: bigint[];
  token2Votes: bigint[];
  startTimes: bigint[];
  endTimes: bigint[];
  settled: boolean[];
  winners: `0x${string}`[];
}

interface Battle {
  id: bigint;
  token1: `0x${string}`;
  token2: `0x${string}`;
  token1Votes: bigint;
  token2Votes: bigint;
  startTime: bigint;
  endTime: bigint;
  settled: boolean;
  winner?: `0x${string}`;
}

const calculateProgressValue = (token1Votes: bigint, token2Votes: bigint): number => {
  try {
    if (token1Votes === BigInt(0) && token2Votes === BigInt(0)) {
      return 50;
    }
    const total = token1Votes + token2Votes;
    if (total === BigInt(0)) {
      return 50;
    }
    return Number((token1Votes * BigInt(100)).toString()) / Number(total.toString());
  } catch (error) {
    console.error('Error calculating progress:', error);
    return 50;
  }
};

const Battles: React.FC = () => {
  const [selectedToken1, setSelectedToken1] = useState<string>("");
  const [selectedToken2, setSelectedToken2] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isVoting, setIsVoting] = useState<bigint | null>(null);
  const [isSettling, setIsSettling] = useState<bigint | null>(null);

  const { createBattle, voteBattle, settleBattle, useAllBattles } = useBattles();
  const { address } = useAccount();

  const { data: tokens, isError: isTokenError, error: tokenError, isLoading: isTokensLoading } = useReadContract({
    address: config.address as Address,
    abi: config.abi,
    functionName: "getTokens",
    args: ["0x0000000000000000000000000000000000000000"] as const,
  }) as { data: TokenData[] | undefined; isError: boolean; error: Error | null; isLoading: boolean };

  const { battles, isError: isBattlesError, error: battlesError, isLoading: isBattlesLoading } = useAllBattles();

  // Consolidated token error handling and logging
  useEffect(() => {
    if (isTokenError && tokenError) {
      console.error('Token fetch error:', tokenError);
      toast.error('Failed to load tokens. Please check your network connection.');
    }
  }, [isTokenError, tokenError]);

  // Consolidated token data logging
  useEffect(() => {
    if (tokens) {
      const graduatedTokens = tokens.filter(t => t.stage === 2);
      console.log('Token data:', {
        raw: tokens,
        graduated: graduatedTokens,
        count: tokens.length,
        graduatedCount: graduatedTokens.length
      });
      
      if (graduatedTokens.length === 0) {
        toast.warning('No graduated tokens available for battle');
      }
    }
  }, [tokens]);

  // Battle data logging
  useEffect(() => {
    if (battles) {
      const parsedBattles = parseBattles(battles);
      console.log('Battle data:', {
        raw: battles,
        parsed: parsedBattles,
        active: getActiveBattles(),
        ended: getEndedBattles()
      });
    }
  }, [battles]);

  // Selection logging
  useEffect(() => {
    if (selectedToken1 || selectedToken2) {
      console.log('Token selection:', {
        token1: selectedToken1,
        token2: selectedToken2,
        token1Data: tokens?.find(t => t.token === selectedToken1),
        token2Data: tokens?.find(t => t.token === selectedToken2)
      });
    }
  }, [selectedToken1, selectedToken2, tokens]);

  // Loading state
  if (isTokensLoading || isBattlesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (isTokenError || isBattlesError) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">
            {tokenError?.message || battlesError?.message || "Failed to load battle data. Please try again."}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const validateTokens = (token1: TokenData, token2: TokenData) => {
    const MIN_TOKENS = BigInt("1000000000000000000000"); // 1000 * 10^18

    if (token1.token === token2.token) {
      toast.error("Cannot battle the same token");
      return false;
    }

    if (token1.stage !== 2 || token2.stage !== 2) {
      toast.error("Only graduated tokens can battle");
      return false;
    }

    try {
      if (token1.supply < MIN_TOKENS || token2.supply < MIN_TOKENS) {
        toast.error("Both tokens must have minimum supply of 1000 tokens");
        return false;
      }
    } catch (error) {
      console.error('Error comparing token supplies:', error);
      toast.error("Error validating token supplies");
      return false;
    }

    return true;
  };

  const isBattleSettleable = (battle: Battle) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    return !battle.settled && battle.endTime <= now;
  };

  const handleCreateBattle = async () => {
    if (!selectedToken1 || !selectedToken2) {
      toast.error("Please select both tokens");
      return;
    }

    const token1Data = tokens?.find(t => t.token === selectedToken1);
    const token2Data = tokens?.find(t => t.token === selectedToken2);

    if (!token1Data || !token2Data) {
      toast.error("Invalid token selection");
      return;
    }

    if (!validateTokens(token1Data, token2Data)) {
      return;
    }

    setIsCreating(true);
    try {
      await createBattle(selectedToken1, selectedToken2, {
        value: parseEther("0.0002")
      });
      
      toast.success("Battle created successfully!");
      setSelectedToken1("");
      setSelectedToken2("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to create battle");
    } finally {
      setIsCreating(false);
    }
  };

  const handleVote = async (battleId: bigint, votingFor: string) => {
    if (!address) {
      toast.error('Please connect your wallet to vote');
      return;
    }
    
    setIsVoting(battleId);
    try {
      await voteBattle(Number(battleId), votingFor, address);
    } catch (error: any) {
      console.error(error);
      if (error.message.includes('must hold')) {
        toast.error('You must hold one of the battle tokens to vote');
      } else {
        toast.error(error.message || 'Failed to vote');
      }
    } finally {
      setIsVoting(null);
    }
  };

  const handleSettleBattle = async (battleId: bigint) => {
    setIsSettling(battleId);
    try {
      await settleBattle(battleId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSettling(null);
    }
  };

  const calculateTimeLeft = (endTime: bigint) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeLeft = endTime - now;
    if (timeLeft <= 0n) return "Ended";
    const minutes = Number(timeLeft / 60n);
    const seconds = Number(timeLeft % 60n);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const parseBattles = (data: any): Battle[] => {
    if (!data || !data[0]) return [];
    
    const battles: Battle[] = [];
    const battleIds = data[0];
    const token1Addresses = data[1];
    const token2Addresses = data[2];
    const token1Votes = data[3];
    const token2Votes = data[4];
    const startTimes = data[5];
    const endTimes = data[6];
    const settled = data[7];
    const winners = data[8];

    for (let i = 0; i < battleIds.length; i++) {
      battles.push({
        id: BigInt(battleIds[i]),
        token1: token1Addresses[i],
        token2: token2Addresses[i],
        token1Votes: BigInt(token1Votes[i]),
        token2Votes: BigInt(token2Votes[i]),
        startTime: BigInt(startTimes[i]),
        endTime: BigInt(endTimes[i]),
        settled: settled[i],
        winner: winners[i] === "0x0000000000000000000000000000000000000000" 
          ? undefined 
          : winners[i]
      });
    }

    return battles;
  };

  const getActiveBattles = (): Battle[] => {
    if (!battles) {
      console.log('No battles data');
      return [];
    }

    const allBattles = parseBattles(battles);
    console.log('Parsed battles:', allBattles);

    const now = BigInt(Math.floor(Date.now() / 1000));
    return allBattles.filter(battle => {
      const isActive = !battle.settled && battle.endTime > now;
      return isActive;
    });
  };

  const getEndedBattles = (): Battle[] => {
    if (!battles) return [];

    const allBattles = parseBattles(battles);
    const now = BigInt(Math.floor(Date.now() / 1000));
    
    return allBattles.filter(battle => 
      battle.settled || battle.endTime <= now
    ).sort((a, b) => Number(b.endTime - a.endTime));
  };

  const tokenList = tokens || [];
  const activeBattles = getActiveBattles();
  const endedBattles = getEndedBattles();

  console.log('Raw battles data:', battles);
  console.log('Active battles:', activeBattles);
  console.log('Ended battles:', endedBattles);

  const isGraduated = (token: TokenData) => {
    console.log('Checking graduation for token:', {
      name: token.name,
      stage: token.stage,
      isGraduated: token.stage === 2
    });
    return token.stage === 2;
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Meme Battles Arena</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create epic battles between meme tokens and vote for your favorites. Winners earn glory and rewards!
          </p>
        </div>

        {/* Battle Creation Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-primary" />
              Create New Battle
            </CardTitle>
            <CardDescription>
              Select two tokens to start an epic battle. Creation fee: 0.0002 BNB
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="w-full md:w-1/3">
                <Select 
                  value={selectedToken1}
                  onValueChange={(value: string) => {
                    console.log('Selected token 1:', value);
                    setSelectedToken1(value);
                  }}
                >
                  <SelectTrigger className="w-full" disabled={isTokensLoading}>
                    <SelectValue placeholder={isTokensLoading ? "Loading tokens..." : "Select First Token"} />
                  </SelectTrigger>
                  <SelectContent>
                    {isTokensLoading ? (
                      <SelectItem value="loading" disabled>Loading tokens...</SelectItem>
                    ) : tokens && tokens.length > 0 ? (
                      tokens.filter(token => 
                        isGraduated(token) && token.token !== selectedToken2
                      ).map((token) => (
                        <SelectItem 
                          key={token.token} 
                          value={token.token}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                          <div className="flex justify-between items-center gap-2">
                            <span>{token.name || formatAddress(token.token)}</span>
                            <span className="text-xs text-primary">(Graduated)</span>
                          </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Supply: {formatTokenAmount(token.supply)} tokens</p>
                                <p>Created: {new Date(Number(token.createdAt) * 1000).toLocaleDateString()}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No tokens available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Swords className="w-6 h-6 text-primary" />
                </div>
              </div>

              <div className="w-full md:w-1/3">
                <Select
                  value={selectedToken2}
                  onValueChange={(value: string) => {
                    console.log('Selected token 2:', value);
                    setSelectedToken2(value);
                  }}
                >
                  <SelectTrigger className="w-full" disabled={isTokensLoading}>
                    <SelectValue placeholder={isTokensLoading ? "Loading tokens..." : "Select Second Token"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tokens?.filter(token => {
                      const graduated = isGraduated(token);
                      const notSelected = token.token !== selectedToken1;
                      console.log('Filtering token:', {
                        name: token.name,
                        graduated,
                        notSelected,
                        willShow: graduated && notSelected
                      });
                      return graduated && notSelected;
                    }).map((token) => (
                      <SelectItem 
                        key={token.token} 
                        value={token.token}
                      >
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                        <div className="flex justify-between items-center gap-2">
                                <span>{token.name || formatAddress(token.token)}</span>
                          <span className="text-xs text-primary">(Graduated)</span>
                        </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Supply: {formatTokenAmount(token.supply)} tokens</p>
                              <p>Created: {new Date(Number(token.createdAt) * 1000).toLocaleDateString()}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleCreateBattle}
                disabled={isCreating || !selectedToken1 || !selectedToken2}
                className="w-full md:w-auto"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Battle...
                  </>
                ) : (
                  <>
                    <Swords className="mr-2 h-4 w-4" />
                    Create Battle
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Battles Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Timer className="w-6 h-6 text-primary" />
            Active Battles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBattles.length > 0 ? (
              activeBattles.map((battle) => (
                <BattleCard
                  key={battle.id.toString()}
                  battle={battle}
                  tokens={tokens || []}
                  onVote={handleVote}
                  onSettle={handleSettleBattle}
                  isVoting={isVoting}
                  isSettling={isSettling}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No active battles at the moment</p>
                <p className="text-sm mt-2">Create a new battle to get started!</p>
              </div>
            )}
          </div>
        </div>

        {/* Ended Battles Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Ended Battles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endedBattles.length > 0 ? (
              endedBattles.map((battle) => (
                <BattleCard
                  key={battle.id.toString()}
                  battle={battle}
                  tokens={tokens || []}
                  onVote={handleVote}
                  onSettle={handleSettleBattle}
                  isVoting={isVoting}
                  isSettling={isSettling}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No ended battles yet</p>
                <p className="text-sm mt-2">Active battles will appear here once they end</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Battles; 