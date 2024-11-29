import React, { useState } from "react";

const CoinDetailPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState<number>(0);
  const [price, setPrice] = useState<number>(0.5); // Example price

  const handleTabSwitch = (tab: "buy" | "sell") => setActiveTab(tab);

  const handleTrade = () => {
    if (amount > 0) {
      alert(`${activeTab === "buy" ? "Bought" : "Sold"} ${amount} coins at $${price}/coin.`);
      setAmount(0);
    } else {
      alert("Enter a valid amount.");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold mb-2">DogeCoin (DOGE)</h1>
          <p className="text-gray-600">The fun and friendly internet currency.</p>
          <div className="flex items-center mt-4">
            <span className="text-lg font-bold text-green-500 mr-4">$0.50</span>
            <span className="text-sm text-gray-500">+2.5% (24h)</span>
          </div>
        </div>

        {/* Chart Section */}
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Price Chart</h2>
          <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
            <p className="text-gray-500">[Insert Chart Here]</p>
          </div>
        </div>

        {/* Buy/Sell Section */}
        <div className="p-6 border-t">
          <div className="flex space-x-6 mb-4">
            <button
              onClick={() => handleTabSwitch("buy")}
              className={`px-6 py-2 rounded-md ${
                activeTab === "buy" ? "bg-blue-600" : "bg-gray-300 text-black"
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => handleTabSwitch("sell")}
              className={`px-6 py-2 rounded-md ${
                activeTab === "sell" ? "bg-red-600" : "bg-gray-300 text-black"
              }`}
            >
              Sell
            </button>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2 border rounded-md mb-4 text-black"
              placeholder="Enter amount"
            />

            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Price per Coin:</span>
              <span className="text-gray-600 font-bold">${price}</span>
            </div>

            <button
              onClick={handleTrade}
              className={`w-full px-4 py-2 text-white font-medium rounded-md ${
                activeTab === "buy" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {activeTab === "buy" ? "Buy Now" : "Sell Now"}
            </button>
          </div>
        </div>

        {/* Coin Details */}
        <div className="p-6 border-t">
          <h2 className="text-xl font-bold mb-4">About DogeCoin</h2>
          <p className="text-gray-600">
            Dogecoin is a cryptocurrency that started as a joke but quickly gained traction in the
            crypto community. It features the Shiba Inu dog from the popular "Doge" meme as its
            mascot. Despite its origins, Dogecoin has become a widely accepted digital asset with
            a loyal following.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoinDetailPage;
