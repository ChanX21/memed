import { useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { readContract } from '@wagmi/core';
import config from '@/config';
import { Address } from 'viem';
import { useToast } from '@/hooks/use-toast';

export type Battle = {
  token1: Address;
  token2: Address;
  votes1: bigint;
  votes2: bigint;
  startTime: bigint;
  endTime: bigint;
  settled: boolean;
};

export type LeaderboardEntry = {
  address: Address;
  wins: bigint;
  battles: bigint;
  votes: bigint;
};

export function useBattles() {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { toast } = useToast();

  const createBattle = async (
    token1: string, 
    token2: string, 
    options: { value: bigint }
  ) => {
    try {
      const hash = await writeContractAsync({
        address: config.battleAddress as Address,
        abi: config.battleAbi.abi,
        functionName: 'createBattle',
        args: [token1 as Address, token2 as Address],
        value: options.value
      });

      toast({
        title: "Battle Created Successfully!",
        description: `Transaction Hash: ${hash}`,
        variant: "default",
      });

      return hash;
    } catch (error) {
      console.error('Error creating battle:', error);
      if (error instanceof Error) {
        if (error.message.includes("User denied transaction signature")) {
          toast({
            title: "Transaction Rejected",
            description: "You rejected the transaction in MetaMask.",
            variant: "destructive",
          });
        } else if (error.message.includes("Token combination in cooldown")) {
          toast({
            title: "Error",
            description: "These tokens have battled recently. Please wait 24 hours between battles.",
            variant: "destructive",
          });
        } else if (error.message.includes("Insufficient creation fee")) {
          toast({
            title: "Error",
            description: "Insufficient BNB for battle creation fee (0.0002 BNB required)",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to create battle",
            variant: "destructive",
          });
        }
      }
      throw error;
    }
  };

  const voteBattle = async (battleId: number, votingFor: string, userAddress: string) => {
    try {
      const hash = await writeContractAsync({
        address: config.battleAddress as Address,
        abi: config.battleAbi.abi,
        functionName: 'vote',
        args: [BigInt(battleId), votingFor as Address],
      });

      toast({
        title: "Vote Submitted Successfully!",
        description: `Transaction Hash: ${hash}`,
        variant: "default",
      });

      return hash;
    } catch (error) {
      console.error('Error voting:', error);
      if (error instanceof Error) {
        if (error.message.includes("User denied transaction signature")) {
          toast({
            title: "Transaction Rejected",
            description: "You rejected the transaction in MetaMask.",
            variant: "destructive",
          });
        } else if (error.message.includes('Already voted')) {
          toast({
            title: "Error",
            description: "You have already voted in this battle",
            variant: "destructive",
          });
        } else if (error.message.includes('Battle ended')) {
          toast({
            title: "Error",
            description: "This battle has ended",
            variant: "destructive",
          });
        } else if (error.message.includes('Battle not started')) {
          toast({
            title: "Error",
            description: "This battle has not started yet",
            variant: "destructive",
          });
        } else if (error.message.includes('No voting power')) {
          toast({
            title: "Error",
            description: "You need to hold tokens to vote",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to vote",
            variant: "destructive",
          });
        }
      }
      throw error;
    }
  };

  const settleBattle = async (battleId: bigint) => {
    try {
      const hash = await writeContractAsync({
        address: config.battleAddress as Address,
        abi: config.battleAbi.abi,
        functionName: 'settleBattle',
        args: [battleId],
      });

      toast({
        title: "Battle Settled Successfully!",
        description: `Transaction Hash: ${hash}`,
        variant: "default",
      });

      return hash;
    } catch (error) {
      console.error('Error settling battle:', error);
      if (error instanceof Error) {
        if (error.message.includes("User denied transaction signature")) {
          toast({
            title: "Transaction Rejected",
            description: "You rejected the transaction in MetaMask.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to settle battle",
            variant: "destructive",
          });
        }
      }
      throw error;
    }
  };

  const useAllBattles = () => {
    const { data, isError, isLoading, error } = useReadContract({
      address: config.battleAddress as Address,
      abi: config.battleAbi.abi,
      functionName: 'getBattles',
      args: [false], // false to get all battles
    });

    return {
      battles: data as Battle[] | undefined,
      isLoading,
      isError,
      error
    };
  };

  const useActiveBattles = () => {
    const { data, isError, isLoading, error } = useReadContract({
      address: config.battleAddress as Address,
      abi: config.battleAbi.abi,
      functionName: 'getBattles',
      args: [true], // true for active battles only
    });

    return {
      battles: data as Battle[] | undefined,
      isLoading,
      isError,
      error
    };
  };

  const useLeaderboard = (limit: number = 10) => {
    const { data, isError, isLoading, error } = useReadContract({
      address: config.battleAddress as Address,
      abi: config.battleAbi.abi,
      functionName: 'getLeaderboard',
      args: [limit],
    });

    const formattedData = data && Array.isArray(data) && data.length >= 4 ? {
      addresses: data[0] as Address[],
      wins: data[1] as bigint[],
      battles: data[2] as bigint[],
      votes: data[3] as bigint[]
    } : undefined;

    return {
      leaderboard: formattedData,
      isLoading,
      isError,
      error
    };
  };

  const useTokenStats = (tokenAddress: string) => {
    const { data, isError, isLoading, error } = useReadContract({
      address: config.battleAddress as Address,
      abi: config.battleAbi.abi,
      functionName: 'getTokenBasicStats',
      args: [tokenAddress as Address],
    });

    return {
      stats: data as { wins: bigint; battles: bigint; votes: bigint } | undefined,
      isLoading,
      isError,
      error
    };
  };

  const useTokenDetails = (tokenAddress: string) => {
    const { data, isError, isLoading, error } = useReadContract({
      address: tokenAddress as Address,
      abi: config.tokenAbi,
      functionName: 'getTokenInfo',
      args: [],
    });

    return {
      details: data as { name: string; symbol: string; totalSupply: bigint } | undefined,
      isLoading,
      isError,
      error
    };
  };

  return {
    createBattle,
    voteBattle,
    settleBattle,
    useAllBattles,
    useActiveBattles,
    useLeaderboard,
    useTokenStats,
    useTokenDetails,
  };
} 