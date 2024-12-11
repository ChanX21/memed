import React, { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { Progress } from "../ui/progress";
import { BigNumberish, formatEther } from "ethers";
import { useReadContract } from "wagmi";
import { useParams } from "react-router-dom";
import tokenAbi from "@/abi/erc20.json";

interface Props {
  supply: bigint;
  description: string;
  image: string;
}
interface Holder {
  address: string;
  balance: number;
}

const CoinInfo: React.FC<Props> = ({ supply, description, image }) => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [percCompleted, setPercCompleted] = useState<number>(0);

  // const { isPending, error, data, refetch } = useQuery({
  //   queryKey: ["tokenHoldersList"],
  //   queryFn: () =>
  //     fetch(
  //       `https://api.etherscan.io/api?module=token&action=tokenholderlist&contractaddress=${tokenAddress}&page=1&offset=10&apikey=${import.meta.env.VITE_ETHERSCAN_API_KEY}`,
  //     ).then((res) => res.json()),
  //   refetchInterval: 500,
  //   refetchOnWindowFocus: true,
  // });

  // Using the useReadContract hook to fetch the total supply of the token
  const { data: totalSupply }: { data: BigNumberish | undefined } =
    useReadContract({
      abi: tokenAbi, // The ABI of the token contract
      address: tokenAddress as `0x${string}`, // The token contract address
      functionName: "totalSupply", // The function to get the total supply of the token
    });

  // useEffect hook to calculate the percentage of the supply that has been minted/used
  useEffect(() => {
    // Check if totalSupply data exists, if not, return early
    if (!totalSupply) return;

    // Define the initial supply of the token (for comparison purposes)
    const initialSupply = 200000000;

    // Convert the total supply (in wei) to ether and calculate the current supply
    const currentSupply = Number(formatEther(totalSupply));

    // Calculate the percentage of the supply that has been used
    const perc = ((currentSupply - initialSupply) / currentSupply) * 100;

    // Update the state with the calculated percentage of the supply used
    setPercCompleted(perc);
  }, [totalSupply]); // Re-run the effect whenever the totalSupply value changes

  return (
    <>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="col-span-1 h-auto max-h-[400px] place-items-center ">
          <img
            src={import.meta.env.VITE_REACT_APP_IPFS_GATEWAY + image}
            className="w-auto h-full"
          />
        </div>
        <div className=" lg:col-span-2 h-auto  pb-10 ">
          <p>{description}</p>
        </div>
      </div>
      {/* bonding curve progress */}
      <div className=" text-gray-400 text-sm">
        <div className="flex justify-between items-center">
          <p>Bonding curve progress: {percCompleted.toFixed(1)}%</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <IoIosInformationCircleOutline size={20} />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] mr-3 bg-secondary">
                <p className="text-gray-400">
                  when the market cap reaches $21000 (~30 bnb), all the
                  liquidity in the bonding curve will be deposited to
                  pancakeswap and burned. progression increases as more tokens
                  are bought. The bonding curve still has{" "}
                  {(1_000_000_000n - supply)
                    // BigInt(parseFloat(formatEther(supply.toString())))
                    .toString()}{" "}
                  tokens available for sale.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Progress className="h-5 my-2 " value={percCompleted} />
        <p>
          graduate this coin to pancakeswap at $21000 market cap there is 30 BNB
          in the bonding curve
        </p>
      </div>
      {/* king og the hill progress */}
      <div className="pt-6 text-gray-400 text-sm">
        <div className="flex justify-between items-center">
          <p>king of the hill progress: 100%</p>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <IoIosInformationCircleOutline size={20} />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] mr-3 bg-secondary">
                <p className="text-gray-400">
                  when the market cap reaches $46,094, this coin will be pinned
                  to the top of the feed (until dethroned)!
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Progress
          className="h-5 my-2 "
          parentBg="bg-yellow-500/50 "
          childBg="bg-yellow-500 "
          value={33}
        />
        <p>crowned king of the hill on 12/3/2024, 11:38:09 AM</p>
      </div>

      {/* holder distribution */}
      {/* <div className="h-auto max-h-[100vh] overflow-y-auto text-gray-400"> */}
      {/*   <h3 className="flex items-center h-12 justify-between font-semibold"> */}
      {/*     Holder distribution */}
      {/*   </h3> */}

      {/*   <table className="min-w-full table-auto border-collapse"> */}
      {/*     <tbody> */}
      {/*       {Array.from({ length: 10 }).map((item, index) => ( */}
      {/*         <tr key={index} className=""> */}
      {/*           <td className="  py-2">{index + 1}</td> {/* Serial Number */}
      {/*           <td className=" py-2 ">0x000</td> {/* Column 1 Data */}
      {/*           <td className="px-4 py-2 text-right">10%</td>{" "} */}
      {/*           {/* Column 2 Data */}
      {/*         </tr> */}
      {/*       ))} */}
      {/*     </tbody> */}
      {/*   </table> */}
      {/* </div> */}
    </>
  );
};

export default CoinInfo;
