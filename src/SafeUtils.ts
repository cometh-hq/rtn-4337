import { defaultConfig, SafeConfig, verifyConfig } from "./SafeConfig";
import rtn4337Module from "./rtn4337Module";
import { EOASigner } from "./signer/EOASigner";
import { PasskeySigner } from "./signer/PasskeySigner";

const predictAddress = (
  chainId: number,
  rpcUrl: string,
  signer: PasskeySigner | EOASigner,
  safeConfig: SafeConfig = defaultConfig,
) => {
  verifyConfig(safeConfig);
  return rtn4337Module.predictAddress(chainId, rpcUrl, signer, safeConfig);
};

export { predictAddress };
