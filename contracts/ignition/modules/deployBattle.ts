import { buildModule } from "@nomicfoundation/hardhat-ignition";

const BattleModule = buildModule("BattleModule", (m) => {
  const FACTORY_ADDRESS = "0x..."; // Your deployed Factory address
  const battle = m.contract("MemedBattle", [FACTORY_ADDRESS as string]);
  return { battle };
});

export default BattleModule; 