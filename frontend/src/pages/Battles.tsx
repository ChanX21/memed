import React, { useState, useEffect } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import config from "@/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Swords, Timer, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useBattles } from '@/hooks/useBattles';
import { Address } from 'viem';

interface TokenData {
  token: `0x${string}`;
  name: string;
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

const Battles: React.FC = () => {
  const [selectedToken1, setSelectedToken1] = useState<string>("");
  const [selectedToken2, setSelectedToken2] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isVoting, setIsVoting] = useState<bigint | null>(null);

  const { createBattle, voteBattle, useActiveBattles } = useBattles();

  const { data: tokens } = useReadContract({
    address: config.address as Address,
    abi: config.abi,
    functionName: "getTokens",
    args: ["0x0000000000000000000000000000000000000000"],
  }) as { data: TokenData[] | undefined };

  const { data: battles } = useReadContract({
    address: config.battleAddress as Address,
    abi: config.battleAbi,
    functionName: 'getBattles',
    args: [true],
  }) as { data: BattleData | undefined };

  useEffect(() => {
    if (tokens) {
      console.log('Token data loaded:', tokens);
    }
  }, [tokens]);

  useEffect(() => {
    if (battles) {
      console.log('Battle data loaded:', battles);
    }
  }, [battles]);

  console.log('Data states:', { 
    tokens: tokens?.length || 0,
    battles: battles ? {
      battleIds: battles.battleIds?.length || 0,
      token1Addresses: battles.token1Addresses?.length || 0
    } : null
  });

  const handleCreateBattle = async () => {
    if (!selectedToken1 || !selectedToken2) {
      toast.error("Please select both tokens");
      return;
    }

    setIsCreating(true);
    try {
      await createBattle(selectedToken1, selectedToken2);
      setSelectedToken1("");
      setSelectedToken2("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleVote = async (battleId: bigint, votingFor: string) => {
    setIsVoting(battleId);
    try {
      await voteBattle(Number(battleId), votingFor);
    } catch (error) {
      console.error(error);
    } finally {
      setIsVoting(null);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const calculateTimeLeft = (endTime: bigint) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const timeLeft = endTime - now;
    if (timeLeft <= 0n) return "Ended";
    const minutes = Number(timeLeft / 60n);
    const seconds = Number(timeLeft % 60n);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const parseBattles = (data: BattleData | undefined): Battle[] => {
    if (!data || !data.battleIds) return [];
    
    return data.battleIds.map((id, index) => ({
      id,
      token1: data.token1Addresses[index],
      token2: data.token2Addresses[index],
      token1Votes: data.token1Votes[index],
      token2Votes: data.token2Votes[index],
      startTime: data.startTimes[index],
      endTime: data.endTimes[index],
      settled: data.settled[index],
      winner: data.winners[index] === "0x0000000000000000000000000000000000000000" 
        ? undefined 
        : data.winners[index]
    }));
  };

  const getActiveBattles = (): Battle[] => {
    if (!battles) {
      console.log('No battles data available');
      return [];
    }

    const allBattles = parseBattles(battles);
    console.log('Parsed battles:', allBattles);

    const now = BigInt(Math.floor(Date.now() / 1000));
    console.log('Current timestamp:', now.toString());
    
    const filtered = allBattles.filter(battle => {
      const isNotSettled = !battle.settled;
      const isNotEnded = battle.endTime > now;
      
      console.log('Battle filtering:', {
        id: battle.id.toString(),
        endTime: battle.endTime.toString(),
        settled: battle.settled,
        isNotSettled,
        isNotEnded,
        shouldInclude: isNotSettled && isNotEnded
      });
      
      return isNotSettled && isNotEnded;
    });
    
    console.log('Filtered active battles:', filtered);
    return filtered;
  };

  const getEndedBattles = (): Battle[] => {
    const allBattles = parseBattles(battles);
    const now = BigInt(Math.floor(Date.now() / 1000));
    
    return allBattles.filter(battle => 
      battle.settled || 
      battle.endTime <= now
    );
  };

  const tokenList = tokens || [];
  const activeBattles = getActiveBattles();
  const endedBattles = getEndedBattles();

  console.log('Raw battles data:', battles);
  console.log('Active battles:', activeBattles);
  console.log('Ended battles:', endedBattles);

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
                  onValueChange={(value) => setSelectedToken1(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select First Token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokenList.map((token: any) => (
                      <SelectItem 
                        key={token.token} 
                        value={token.token}
                      >
                        {token.name || formatAddress(token.token)}
                      </SelectItem>
                    ))}
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
                  onValueChange={(value) => setSelectedToken2(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Second Token" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokenList.map((token: any) => (
                      <SelectItem 
                        key={token.token} 
                        value={token.token}
                      >
                        {token.name || formatAddress(token.token)}
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
          <h2 className="text-2xl font-bold mb-6">Active Battles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBattles.length > 0 ? (
              activeBattles.map((battle) => (
                <Card key={battle.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Battle {battle.id.toString()}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Timer className="w-4 h-4" />
                        {calculateTimeLeft(battle.endTime)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <p className="font-medium">{formatAddress(battle.token1)}</p>
                          <p className="text-muted-foreground">
                            {battle.token1Votes.toString()} votes
                          </p>
                        </div>
                        <div className="text-sm text-right">
                          <p className="font-medium">{formatAddress(battle.token2)}</p>
                          <p className="text-muted-foreground">
                            {battle.token2Votes.toString()} votes
                          </p>
                        </div>
                      </div>

                      <Progress 
                        value={
                          (Number(battle.token1Votes) /
                            (Number(battle.token1Votes) + Number(battle.token2Votes))) *
                          100 || 50
                        } 
                        className="h-2"
                      />

                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleVote(battle.id, battle.token1)}
                          className="flex-1"
                          disabled={isVoting === battle.id}
                          variant="outline"
                        >
                          {isVoting === battle.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            `Vote ${formatAddress(battle.token1)}`
                          )}
                        </Button>
                        <Button 
                          onClick={() => handleVote(battle.id, battle.token2)}
                          className="flex-1"
                          disabled={isVoting === battle.id}
                          variant="outline"
                        >
                          {isVoting === battle.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            `Vote ${formatAddress(battle.token2)}`
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
        {endedBattles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Ended Battles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {endedBattles.map((battle) => (
                <Card key={battle.id} className="hover:shadow-lg transition-shadow opacity-75">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        Battle {battle.id.toString()}
                      </CardTitle>
                      <div className="text-sm font-medium text-primary">
                        {battle.settled ? 'Settled' : 'Ended'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <p className="font-medium">{formatAddress(battle.token1)}</p>
                          <p className="text-muted-foreground">
                            {battle.token1Votes.toString()} votes
                          </p>
                        </div>
                        <div className="text-sm text-right">
                          <p className="font-medium">{formatAddress(battle.token2)}</p>
                          <p className="text-muted-foreground">
                            {battle.token2Votes.toString()} votes
                          </p>
                        </div>
                      </div>

                      <Progress 
                        value={
                          (Number(battle.token1Votes) /
                            (Number(battle.token1Votes) + Number(battle.token2Votes))) *
                          100 || 50
                        } 
                        className="h-2"
                      />

                      {battle.settled && battle.winner && (
                        <div className="text-center">
                          <span className="text-sm font-medium text-primary">
                            Winner: {formatAddress(battle.winner)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Battles; 