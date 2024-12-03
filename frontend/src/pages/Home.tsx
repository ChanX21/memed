import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Memecoin, NewMeme } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemeForm } from "@/components/home/MemeForm";
import Uploady from "@rpldy/uploady";
import { Link } from "react-router-dom";

interface DynamicComponent {
  bgColor: string;
  text: string;
}

const initialMemecoins: Memecoin[] = [
  {
    image: "https://via.placeholder.com/200", // Replace with actual image URLs
    name: "DogeCoin",
    address: "0x0000000000000000000000000000000000000000",
    creator: "0x0000000000000000000000000000000000000001",
    time: "2013-12-06",
    description:
      "This NFT, titled Ethereal Horizon is a visually stunning digital artwork capturing the serene beauty of a futuristic landscape.",
    marketCap: "$10 Billion", // Add marketCap here
  },
  {
    image: "https://via.placeholder.com/200",
    name: "Shiba Inu",
    address: "0x0000000000000000000000000000000000000001",
    creator: "0x0000000000000000000000000000000000000002",
    time: "2020-08-01",
    description:
      "This NFT, titled Ethereal Horizon is a visually stunning digital artwork capturing the serene beauty of a futuristic landscape.",
    marketCap: "$5 Billion", // Add marketCap here
  },
  {
    image: "https://via.placeholder.com/200",
    name: "Pepe",
    address: "0x0000000000000000000000000000000000000002",
    creator: "0x0000000000000000000000000000000000000003",
    time: "2023-04-20",
    description:
      "This NFT, titled Ethereal Horizon is a visually stunning digital artwork capturing the serene beauty of a futuristic landscape.",
    marketCap: "$1 Billion", // Add marketCap here
  },
  {
    image: "https://via.placeholder.com/200",
    name: "Pepe",
    address: "0x0000000000000000000000000000000000000002",
    creator: "0x0000000000000000000000000000000000000003",
    time: "2023-04-20",
    description:
      "This NFT, titled Ethereal Horizon is a visually stunning digital artwork capturing the serene beauty of a futuristic landscape.",
    marketCap: "$1 Billion", // Add marketCap here
  },
  {
    image: "https://via.placeholder.com/200",
    name: "Pepe",
    address: "0x0000000000000000000000000000000000000002",
    creator: "0x0000000000000000000000000000000000000003",
    time: "2023-04-20",
    description:
      "This NFT, titled Ethereal Horizon is a visually stunning digital artwork capturing the serene beauty of a futuristic landscape.",
    marketCap: "$1 Billion", // Add marketCap here
  },
  {
    image: "https://via.placeholder.com/200",
    name: "Pepe",
    address: "0x0000000000000000000000000000000000000002",
    creator: "0x0000000000000000000000000000000000000003",
    time: "2023-04-20",
    description:
      "This NFT, titled Ethereal Horizon is a visually stunning digital artwork capturing the serene beauty of a futuristic landscape.",
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

  const [component1, setComponent1] = useState<DynamicComponent>({
    bgColor: "bg-gray-200",
    text: "[Address] bought BNB amount of [Token]",
  });

  const [component2, setComponent2] = useState<DynamicComponent>({
    bgColor: "bg-gray-200",
    text: "[Address] created [Token] on [Date]",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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

  const getRandomColor = (): string =>
    `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const randomAddress = (): string =>
    `0x${Math.random().toString(36).substring(2, 10)}`;
  const randomToken = (): string => `Token-${Math.floor(Math.random() * 100)}`;
  const randomAmount = (): string => (Math.random() * 10).toFixed(2);
  const randomDate = (): string =>
    new Date(
      Date.now() - Math.floor(Math.random() * 10000000000),
    ).toLocaleDateString();

  useEffect(() => {
    const interval = setInterval(() => {
      setComponent1({
        bgColor: getRandomColor(),
        text: `${randomAddress()} bought ${randomAmount()} BNB of ${randomToken()}`,
      });
      setComponent2({
        bgColor: getRandomColor(),
        text: `${randomAddress()} created ${randomToken()} on ${randomDate()}`,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-6 ">
      <div className="flex w-full max-w-3xl items-center m-auto h-12 space-x-2">
        <Input type="text" placeholder="Search meme" className="h-full" />
        <Button type="submit" variant="secondary" className="h-full w-52">
          Search
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-5  my-8 w-full justify-center">
        <div
          className="p-2 rounded-md text-sm text-black"
          style={{ backgroundColor: component1.bgColor }}
        >
          {component1.text}
        </div>
        <div
          className="p-2 rounded-md text-sm text-black"
          style={{ backgroundColor: component2.bgColor }}
        >
          {component2.text}
        </div>
      </div>
      <div className="flex justify-between max-w-4xl mx-auto mb-4"></div>
      <div className="w-full h-auto mb-3 flex justify-between">
        <Uploady
          multiple
          grouped
          maxGroupSize={2}
          method="PUT"
          destination={{
            url: "https://my-server",
            headers: { "x-custom": "123" },
          }}
        >
          <MemeForm />
        </Uploady>
        <Select defaultValue="date">
          <SelectTrigger className="w-[180px] ">Sort</SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="date" className="cursor-pointer">
                Date
              </SelectItem>
              <SelectItem value="trade" className="cursor-pointer">
                Trade
              </SelectItem>
              <SelectItem value="marketcap" className="cursor-pointer">
                Market cap
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-10  place-items-center ">
        {memecoins.map((coin, index) => (
          <Link to={`coin/${coin.address}`}>
            {" "}
            <Card className="w-full max-w-[400px]">
              <CardHeader>
                <CardTitle className="text-sm flex justify-between items-center">
                  <div className="flex gap-2">
                    <p className="text-gray-500">By: </p>
                    <p className="">0x00 </p>
                  </div>

                  <p className="text-gray-500 text-sm">8 days ago </p>
                </CardTitle>
                {/* <CardDescription className="h-56"></CardDescription> */}
              </CardHeader>
              <CardContent>
                <img
                  src={coin.image}
                  alt={coin.name}
                  className="w-full h-full rounded-xl"
                />
              </CardContent>
              <CardDescription className=" px-6 flex flex-col gap-3">
                <div className="flex items-center justify-between w-full">
                  <h4 className="font-semibold">{coin.name}</h4>
                  <span className="text-primary font-semibold text-md">
                    {coin.marketCap}
                  </span>
                </div>
                <div className="  w-full">
                  {coin.description.substring(0, 100)}
                  {"   "}
                  {coin.description.length > 100 && (
                    <span className="font-semibold hover:underline cursor-pointer ">
                      More...
                    </span>
                  )}
                </div>
              </CardDescription>
              <CardFooter className="flex justify-between"></CardFooter>
            </Card>
          </Link>
        ))}
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
