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
import { TokenData } from "../types";
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
import { useReadContract } from "wagmi";
import config from '@/config.json';
import { formatDistanceToNow } from "date-fns";

interface DynamicComponent {
  bgColor: string;
  text: string;
}



const Home: React.FC = () => {
  const { data: memecoins }: { data: TokenData[] | undefined } = useReadContract({
    abi: config.abi,
    address: config.address as `0x${string}`,
    functionName: "getTokens",
    args: ['0x0000000000000000000000000000000000000000']
  });

  const [component1, setComponent1] = useState<DynamicComponent>({
    bgColor: "bg-gray-200",
    text: "[Address] bought BNB amount of [Token]",
  });

  const [component2, setComponent2] = useState<DynamicComponent>({
    bgColor: "bg-gray-200",
    text: "[Address] created [Token] on [Date]",
  });


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
        {memecoins&&memecoins.map((coin, index) => (
          <Link to={`coin/${coin.token}`}>
            {" "}
            <Card className="w-full max-w-[400px]">
              <CardHeader>
                <CardTitle className="text-sm flex justify-between items-center">
                  <div className="flex gap-2">
                    <p className="text-gray-500">By: </p>
                    <p className="">{`${coin.owner.slice(0,4)}...${coin.owner.slice(-4)}`} </p>
                  </div>

                  <p className="text-gray-500 text-sm">{formatDistanceToNow(new Date(parseInt(coin.createdAt.toString()) * 1000), { addSuffix: true })}</p>
                </CardTitle>
                {/* <CardDescription className="h-56"></CardDescription> */}
              </CardHeader>
              <CardContent>
                <img
                  src={import.meta.env.VITE_REACT_APP_IPFS_GATEWAY+coin.image}
                  alt={coin.name}
                  className="w-full h-full rounded-xl"
                />
              </CardContent>
              <CardDescription className=" px-6 flex flex-col gap-3">
                <div className="flex items-center justify-between w-full">
                  <h4 className="font-semibold">{coin.name}</h4>
                  <span className="text-primary font-semibold text-md">
                    ${(coin.collateral * (coin.supply - 200_000_000n) * 700n).toString()}
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
    </div>
  );
};

export default Home;
