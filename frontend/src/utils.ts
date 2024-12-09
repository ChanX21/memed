export function truncateWalletAddress(
  address: string,
  length: number = 6,
): string {
  if (!address || address.length <= length * 2) {
    return address; // Return original if address is too short to truncate
  }

  const start = address.slice(0, length); // First 'length' characters
  const end = address.slice(-length); // Last 'length' characters
  return `${start}...${end}`;
}
