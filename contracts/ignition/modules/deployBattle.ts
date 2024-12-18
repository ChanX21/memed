import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BattleModule = buildModule("BattleModule", (m) => {
  const FACTORY_ADDRESS = "0x2f766a04e25D07465877D8084bfBd5a1d7B58ec9";
  
  const battle = m.contract("MemedBattle", [FACTORY_ADDRESS]);

  return {
    battle,
  };
});

export default BattleModule;