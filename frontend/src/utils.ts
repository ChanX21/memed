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

export function formatCurrency(value: number) {
  const units = [
    { threshold: 1e12, suffix: "T" }, // Trillion
    { threshold: 1e9, suffix: "B" }, // Billion
    { threshold: 1e6, suffix: "M" }, // Million
    { threshold: 1e3, suffix: "K" }, // Thousand
  ];

  // Assume the value is already in the desired unit
  const amount = value; // Directly use the number

  // Find the appropriate unit
  for (const unit of units) {
    if (amount >= unit.threshold) {
      const scaledValue = amount / unit.threshold;
      return `${scaledValue.toFixed(2)} ${unit.suffix} USD`; // Adjust decimal precision as needed
    }
  }

  // Default formatting for smaller numbers
  return Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}
