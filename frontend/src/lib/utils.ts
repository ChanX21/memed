import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTokenAmount = (amount: bigint): string => {
  try {
    const formatted = Number(amount) / 1e18;
    return formatted.toLocaleString(undefined, {
      maximumFractionDigits: 2
    });
  } catch (error) {
    console.error('Error formatting token amount:', error);
    return '0';
  }
};
