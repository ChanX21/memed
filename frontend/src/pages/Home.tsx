import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Memecoin, NewMeme } from "../types";


const initialMemecoins: Memecoin[] = [
  {
    image: "https://via.placeholder.com/50", // Replace with actual image URLs
    name: "DogeCoin",
    address: "0x0000000000000000000000000000000000000000",
    creator: "0x0000000000000000000000000000000000000001",
    time: "2013-12-06",
    description: "A popular meme coin",
    marketCap: "$10 Billion", // Add marketCap here
  },
  {
    image: "https://via.placeholder.com/50",
    name: "Shiba Inu",
    address: "0x0000000000000000000000000000000000000001",
    creator: "0x0000000000000000000000000000000000000002",
    time: "2020-08-01",
    description: "A dog-themed cryptocurrency",
    marketCap: "$5 Billion", // Add marketCap here
  },
  {
    image: "https://via.placeholder.com/50",
    name: "Pepe",
    address: "0x0000000000000000000000000000000000000002",
    creator: "0x0000000000000000000000000000000000000003",
    time: "2023-04-20",
    description: "Pepe meme-based coin",
    marketCap: "$1 Billion", // Add marketCap here
  },
];

const Home: React.FC = () => {
  const [memecoins, setMemecoins] = useState<Memecoin[]>(initialMemecoins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMeme, setNewMeme] = useState<NewMeme>({
    image: "",
    name: "",
    description: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMeme((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMeme((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMeme = () => {
    if (newMeme.image && newMeme.name && newMeme.description) {
      setIsModalOpen(false);
      setNewMeme({ image: "", name: "", description: "" });
    }
  };

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Memes</h1>
      <div className="flex justify-between max-w-4xl mx-auto mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
        >
          Create Meme
        </button>
      </div>
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full text-left border-collapse text-black">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3 text-sm font-medium text-gray-900">Image</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-900">Name</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-900">Creator</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-900">Created</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-900">Description</th>
              <th className="px-6 py-3 text-sm font-medium text-gray-900">Market Cap</th> {/* Added Market Cap column */}
            </tr>
          </thead>
          <tbody>
            {memecoins.map((coin, index) => (
              <tr
                key={index}
                className={`border-b ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                <td className="px-6 py-4">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    className="w-10 h-10 rounded-full"
                  />
                </td>
                <Link to={`/coin/${coin.address}`}>
                  <td className="px-6 py-4 text-teal-500 font-bold">{coin.name}</td>
                </Link>
                <td className="px-6 py-4">{`${coin.creator.slice(0, 5)}...${coin.creator.slice(-4)}`}</td>
                <td className="px-6 py-4">{coin.time}</td>
                <td className="px-6 py-4">{coin.description}</td> {/* Display description */}
                <td className="px-6 py-4 text-green-500 font-semibold">{coin.marketCap}</td> {/* Display Market Cap */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-black p-6 rounded-md shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create Memecoin</h2>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={newMeme.name}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 border rounded-md bg-blue-700"
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 mb-4 border rounded-md bg-blue-700"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newMeme.description}
              onChange={handleInputChange}
              className="w-full p-2 mb-4 border rounded-md bg-blue-700"
              rows={4}
            />
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 mr-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMeme}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
