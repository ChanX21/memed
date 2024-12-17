import { useReadContract, useWriteContract } from 'wagmi';
import config from '@/config';
import { toast } from 'sonner';

export const useBattles = () => {
  const { writeContract } = useWriteContract();

  const createBattle = async (token1: string, token2: string) => {
    try {
      const tx = await writeContract({
        address: config.battleAddress,
        abi: config.battleAbi,
        functionName: 'createBattle',
        args: [token1, token2],
        value: BigInt('200000000000000'), // 0.0002 BNB
      });
      toast.success('Battle creation initiated!');
      return tx;
    } catch (error: any) {
      console.error('Error creating battle:', error);
      toast.error(error?.message || 'Failed to create battle');
      throw error;
    }
  };

  const voteBattle = async (battleId: number, votingFor: string) => {
    try {
      const tx = await writeContract({
        address: config.battleAddress,
        abi: config.battleAbi,
        functionName: 'vote',
        args: [BigInt(battleId), votingFor],
      });
      toast.success('Vote submitted successfully!');
      return tx;
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error?.message || 'Failed to vote');
      throw error;
    }
  };

  const useActiveBattles = () => {
    return useReadContract({
      address: config.battleAddress,
      abi: config.battleAbi,
      functionName: 'getBattles',
      args: [true], // true for active battles only
    });
  };

  const useLeaderboard = (limit: number = 10) => {
    return useReadContract({
      address: config.battleAddress,
      abi: config.battleAbi,
      functionName: 'getLeaderboard',
      args: [limit],
    });
  };

  const useTokenStats = (tokenAddress: string) => {
    return useReadContract({
      address: config.battleAddress,
      abi: config.battleAbi,
      functionName: 'getTokenBasicStats',
      args: [tokenAddress],
    });
  };

  return {
    createBattle,
    voteBattle,
    useActiveBattles,
    useLeaderboard,
    useTokenStats,
  };
}; 