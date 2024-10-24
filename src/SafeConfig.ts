import { isValidEthereumAddress } from "./Utils";

interface SafeConfig {
  safeModuleSetupAddress?: string;
  safe4337ModuleAddress?: string;
  safeSingletonL2Address?: string;
  safeProxyFactoryAddress?: string;
  safeWebAuthnSharedSignerAddress?: string;
  safeMultiSendAddress?: string;
  safeP256VerifierAddress?: string;
  safeWebauthnSignerFactoryAddress?: string;
  entryPointAddress?: string;
}

const defaultConfig: SafeConfig = {
  safeModuleSetupAddress: "0x2dd68b007B46fBe91B9A7c3EDa5A7a1063cB5b47",
  safe4337ModuleAddress: "0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226",
  safeSingletonL2Address: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762",
  safeProxyFactoryAddress: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67",
  safeWebAuthnSharedSignerAddress: "0xfD90FAd33ee8b58f32c00aceEad1358e4AFC23f9",
  safeMultiSendAddress: "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526",
  safeP256VerifierAddress: "0x445a0683e494ea0c5AF3E83c5159fBE47Cf9e765",
  safeWebauthnSignerFactoryAddress:
    "0xF7488fFbe67327ac9f37D5F722d83Fc900852Fbf",
  entryPointAddress: "0x0000000071727De22E5E9d8BAf0edAc6f37da032",
};

const verifyConfig = (config: SafeConfig) => {
  if (config.safeModuleSetupAddress)
    requireHexAddress("safeModuleSetupAddress", config.safeModuleSetupAddress);
  if (config.safe4337ModuleAddress)
    requireHexAddress("safe4337ModuleAddress", config.safe4337ModuleAddress);
  if (config.safeSingletonL2Address)
    requireHexAddress("safeSingletonL2Address", config.safeSingletonL2Address);
  if (config.safeProxyFactoryAddress)
    requireHexAddress(
      "safeProxyFactoryAddress",
      config.safeProxyFactoryAddress,
    );
  if (config.safeWebAuthnSharedSignerAddress)
    requireHexAddress(
      "safeWebAuthnSharedSignerAddress",
      config.safeWebAuthnSharedSignerAddress,
    );
  if (config.safeMultiSendAddress)
    requireHexAddress("safeMultiSendAddress", config.safeMultiSendAddress);
  if (config.safeP256VerifierAddress)
    requireHexAddress(
      "safeP256VerifierAddress",
      config.safeP256VerifierAddress,
    );
  if (config.safeWebauthnSignerFactoryAddress)
    requireHexAddress(
      "safeWebauthnSignerFactoryAddress",
      config.safeWebauthnSignerFactoryAddress,
    );
  if (config.entryPointAddress)
    requireHexAddress("entryPointAddress", config.entryPointAddress);
};

const requireHexAddress = (name: string, address: string) => {
  if (!isValidEthereumAddress(address)) {
    throw new Error(`Invalid ${name} address: ${address}`);
  }
};

export { SafeConfig, verifyConfig, defaultConfig };
