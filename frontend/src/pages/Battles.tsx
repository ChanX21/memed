import React, { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import config from "@/config.json";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Swords, Timer, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Battles: React.FC = () => {
  const [selectedToken1, setSelectedToken1] = useState<string>("");
  const [selectedToken2, setSelectedToken2] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [isVoting, setIsVoting] = useState<number | null>(null);

  const { data: tokens, isLoading: tokensLoading } = useReadContract({
    abi: config.abi,
    address: config.address as `0x${string}`,
    functionName: "getTokens",
    args: ["0x0000000000000000000000000000000000000000"],
  });

  const { data: battles, isLoading: battlesLoading } = useReadContract({
    abi: config.battleAbi,
    address: config.battleAddress as `0x${string}`,
    functionName: "getBattles",
    args: [true],
  });

  const { writeContract } = useWriteContract();

  const handleCreateBattle = async () => {
    if (!selectedToken1 || !selectedToken2) {
      toast.error("Please select both tokens");
      return;
    }

    setIsCreating(true);
    try {
      await writeContract({
        abi: config.battleAbi,
        address: config.battleAddress as `0x${string}`,
        functionName: "createBattle",
        args: [selectedToken1, selectedToken2],
        value: BigInt("200000000000000"),
      });
      toast.success("Battle creation initiated!");
      setSelectedToken1("");
      setSelectedToken2("");
    } catch (error) {
      toast.error("Failed to create battle");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleVote = async (battleId: number, votingFor: string) => {
    setIsVoting(battleId);
    try {
      await writeContract({
        abi: config.battleAbi,
        address: config.battleAddress as `0x${string}`,
        functionName: "vote",
        args: [battleId, votingFor],
      });
      toast.success("Vote submitted!");
    } catch (error) {
      toast.error("Failed to vote");
      console.error(error);
    } finally {
      setIsVoting(null);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const calculateTimeLeft = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = endTime - now;
    if (timeLeft <= 0) return "Ended";
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (tokensLoading || battlesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
                    {tokens?.map((token: any) => (
                      <SelectItem key={token.token} value={token.token}>
                        {token.name}
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
                    {tokens?.map((token: any) => (
                      <SelectItem key={token.token} value={token.token}>
                        {token.name}
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

        {/* Active Battles List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {battles?.battleIds.map((battleId: number, index: number) => (
            <Card key={battleId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Battle #{battleId}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Timer className="w-4 h-4" />
                    {calculateTimeLeft(battles.endTimes[index])}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      <p className="font-medium">{formatAddress(battles.token1Addresses[index])}</p>
                      <p className="text-muted-foreground">
                        {battles.token1Votes[index].toString()} votes
                      </p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="font-medium">{formatAddress(battles.token2Addresses[index])}</p>
                      <p className="text-muted-foreground">
                        {battles.token2Votes[index].toString()} votes
                      </p>
                    </div>
                  </div>

                  <Progress 
                    value={
                      (Number(battles.token1Votes[index]) /
                        (Number(battles.token1Votes[index]) + Number(battles.token2Votes[index]))) *
                      100 || 50
                    } 
                    className="h-2"
                  />

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleVote(battleId, battles.token1Addresses[index])}
                      className="flex-1"
                      disabled={isVoting === battleId}
                      variant="outline"
                    >
                      {isVoting === battleId ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Vote Token 1"
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleVote(battleId, battles.token2Addresses[index])}
                      className="flex-1"
                      disabled={isVoting === battleId}
                      variant="outline"
                    >
                      {isVoting === battleId ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Vote Token 2"
                      )}
                    </Button>
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

export default Battles; 