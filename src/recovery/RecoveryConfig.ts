import { isValidEthereumAddress, requireHexAddress } from "../Utils";

interface RecoveryConfig {
  moduleFactoryAddress?: string;
  delayModuleAddress?: string;
  recoveryCooldown?: number;
  recoveryExpiration?: number;
}

const defaultRecoveryConfig: RecoveryConfig = {
  moduleFactoryAddress: "0x000000000000aDdB49795b0f9bA5BC298cDda236",
  delayModuleAddress: "0xd54895B1121A2eE3f37b502F507631FA1331BED6",
  recoveryCooldown: 86400,
  recoveryExpiration: 604800,
};

const verifyConfig = (config: RecoveryConfig) => {
  if (config.moduleFactoryAddress)
    requireHexAddress("moduleFactoryAddress", config.moduleFactoryAddress);
  if (config.delayModuleAddress)
    requireHexAddress("delayModuleAddress", config.delayModuleAddress);
  if (config.recoveryCooldown)
    if (config.recoveryCooldown <= 0)
      throw new Error("recoveryCooldown must be greater than 0");
  if (config.recoveryExpiration)
    if (config.recoveryExpiration <= 0)
      throw new Error("recoveryExpiration must be greater than 0");
};

export { RecoveryConfig, verifyConfig, defaultRecoveryConfig };
