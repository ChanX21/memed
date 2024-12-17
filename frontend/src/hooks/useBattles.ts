import { useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { readContract } from '@wagmi/core';
import config from '@/config';
import { toast } from 'sonner';
import { Address } from 'viem';

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

export const useBattles = () => {
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  // const checkTokenBalance = async (tokenAddress: string, userAddress: string) => {
  //   try {
  //     const data = await readContract<Address, typeof config.tokenAbi, 'balanceOf', [Address]>({
  //       address: tokenAddress as Address,
  //       abi: config.tokenAbi,
  //       functionName: 'balanceOf',
  //       args: [userAddress as Address],
  //     }) as bigint;
      
  //     return data > 0n;
  //   } catch (error) {
  //     console.error('Error checking token balance:', error);
  //     return false;
  //   }
  // };

  const createBattle = async (
    token1: string, 
    token2: string, 
    options: { value: bigint }
  ) => {
    try {
      const hash = await writeContractAsync({
        address: config.battleAddress as Address,
        abi: config.battleAbi,
        functionName: 'createBattle',
        args: [token1 as Address, token2 as Address],
        value: options.value
      });

      toast.success('Battle creation initiated!');
      return hash;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Token combination in cooldown")) {
          toast.error("These tokens have battled recently. Please wait 24 hours between battles.");
        } else if (error.message.includes("Insufficient creation fee")) {
          toast.error("Insufficient BNB for battle creation fee (0.0002 BNB required)");
        } else {
          toast.error(error.message || "Failed to create battle");
        }
      }
      throw error;
    }
  };

  const voteBattle = async (battleId: number, votingFor: string, userAddress: string) => {
    try {
      console.log('Voting for battle:', {
        battleId,
        votingFor,
        userAddress
      });

      const hash = await writeContractAsync({
        address: config.battleAddress as Address,
        abi: config.battleAbi,
        functionName: 'vote',
        args: [BigInt(battleId), votingFor as Address],
      });

      toast.success('Vote submitted successfully!');
      return hash;
    } catch (error) {
      console.error('Error voting:', error);
      if (error instanceof Error) {
        if (error.message.includes('Already voted')) {
          toast.error('You have already voted in this battle');
        } else if (error.message.includes('Battle ended')) {
          toast.error('This battle has ended');
        } else if (error.message.includes('Battle not started')) {
          toast.error('This battle has not started yet');
        } else if (error.message.includes('No voting power')) {
          toast.error('You need to hold tokens to vote');
        } else {
          toast.error(error.message || 'Failed to vote');
        }
      }
      throw error;
    }
  };

  const settleBattle = async (battleId: bigint) => {
    try {
      const hash = await writeContractAsync({
        address: config.battleAddress as Address,
        abi: config.battleAbi,
        functionName: 'settleBattle',
        args: [battleId],
      });
      toast.success('Battle settlement initiated!');
      return hash;
    } catch (error) {
      console.error('Error settling battle:', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to settle battle');
      }
      throw error;
    }
  };

  const useAllBattles = () => {
    const { data, isError, isLoading, error } = useReadContract({
      address: config.battleAddress as Address,
      abi: config.battleAbi,
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
      abi: config.battleAbi,
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
      abi: config.battleAbi,
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
      abi: config.battleAbi,
      functionName: 'getTokenBasicStats',
      args: [tokenAddress as Address],
      // Removed 'enabled' property as it does not exist in the type
    });

    return {
      stats: data as { wins: bigint; battles: bigint; votes: bigint } | undefined,
      isLoading,
      isError,
      error
    };
  }; // Corrected the extra closing brace

  const useTokenDetails = (tokenAddress: string) => {
    const { data, isError, isLoading, error } = useReadContract({
      address: tokenAddress as Address,
      abi: config.tokenAbi,
      functionName: 'getTokenInfo',
      args: [],
      // Removed 'enabled' property as it does not exist in the type
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
}; 