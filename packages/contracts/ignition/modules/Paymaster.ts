import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VerifyingPaymasterModule", (m) => {
  const entryPoint = m.getParameter("entryPoint");
  const verifyingSigner = m.getParameter("verifyingSigner");

  const paymaster = m.contract("VerifyingPaymaster", [entryPoint, verifyingSigner]);

  return { paymaster };
});
