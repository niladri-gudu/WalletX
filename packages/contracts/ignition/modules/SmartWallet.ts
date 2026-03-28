import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("SmartWalletModule", (m) => {
  const owner = m.getParameter("owner");
  const entryPoint = m.getParameter("entryPoint");

  const wallet = m.contract("SmartWallet", [owner, entryPoint]);

  return { wallet };
});
