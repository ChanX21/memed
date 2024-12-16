import { ethers } from "hardhat";

async function main() {
  // Get existing Factory address
  const FACTORY_ADDRESS = "0x..."; // Your deployed Factory address

  // Deploy MemedBattle
  const MemedBattle = await ethers.getContractFactory("MemedBattle");
  const battle = await MemedBattle.deploy(FACTORY_ADDRESS as string);
  await battle.deployed();
  console.log("MemedBattle deployed to:", battle.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 