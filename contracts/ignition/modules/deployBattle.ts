import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BattleModule = buildModule("BattleModule", (m) => {
  const FACTORY_ADDRESS = "0x2ebE9162A3c629c6e23689DD302A8efA1AcA6c3B";
  
  const battle = m.contract("MemedBattle", [FACTORY_ADDRESS]);

  return {
    battle,
  };
});

export default BattleModule;