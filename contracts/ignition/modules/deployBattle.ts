import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BattleModule = buildModule("BattleModule", (m) => {
  const FACTORY_ADDRESS = "0xDb988a31F8685905D1aCe4e6CD9c2489e937bDF6";
  
  const battle = m.contract("MemedBattle", [FACTORY_ADDRESS]);

  return {
    battle,
  };
});

export default BattleModule;