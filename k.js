const k = 46875; // The constant rate of change
const targetPrice = 0.001; // Target price in BNB
const scalingFactor = 10 ** 18; // Scaling factor to match BNB decimals

// Recalculate offset to achieve the target price for the first token
const calculateOffset = (k, targetPrice, scalingFactor) => {
  return (targetPrice * scalingFactor) - (k * 1);
};

// Verify the first token price
const calculatePrice = (newSupply, k, offset, scalingFactor) => {
  return (k * newSupply + offset) / scalingFactor;
};

const offset = calculateOffset(k, targetPrice, scalingFactor);
const firstTokenPrice = calculatePrice(1, k, offset, scalingFactor);

console.log("Calculated Offset:", offset);
console.log("First Token Price:", firstTokenPrice);
