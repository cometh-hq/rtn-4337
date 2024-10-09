import {isValidEthereumAddress} from "./Utils";

interface SafeConfig {
  safeModuleSetupAddress?: string,
  safe4337ModuleAddress?: string,
  safeSingletonL2Address?: string,
  safeProxyFactoryAddress?: string,
  safeWebAuthnSharedSignerAddress?: string,
  safeMultiSendAddress?: string,
  safeP256VerifierAddress?: string,
  safeWebauthnSignerFactoryAddress?: string,
}

const verifyConfig = (config: SafeConfig) => {
  if (config.safeModuleSetupAddress) requireHexAddress('safeModuleSetupAddress', config.safeModuleSetupAddress)
  if (config.safe4337ModuleAddress) requireHexAddress('safe4337ModuleAddress', config.safe4337ModuleAddress)
  if (config.safeSingletonL2Address) requireHexAddress('safeSingletonL2Address', config.safeSingletonL2Address)
  if (config.safeProxyFactoryAddress) requireHexAddress('safeProxyFactoryAddress', config.safeProxyFactoryAddress)
  if (config.safeWebAuthnSharedSignerAddress) requireHexAddress('safeWebAuthnSharedSignerAddress', config.safeWebAuthnSharedSignerAddress)
  if (config.safeMultiSendAddress) requireHexAddress('safeMultiSendAddress', config.safeMultiSendAddress)
  if (config.safeP256VerifierAddress) requireHexAddress('safeP256VerifierAddress', config.safeP256VerifierAddress)
  if (config.safeWebauthnSignerFactoryAddress) requireHexAddress('safeWebauthnSignerFactoryAddress', config.safeWebauthnSignerFactoryAddress)
}

const requireHexAddress = (name: string, address: string) => {
  if (!isValidEthereumAddress(address)) {
    throw new Error(`Invalid ${name} address: ${address}`)
  }
}

export {
  SafeConfig,
  verifyConfig
}



