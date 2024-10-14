import {TurboModule, TurboModuleRegistry} from "react-native";

export interface Spec extends TurboModule {
  sendUserOperation(
    chainId: number,
    rpcUrl: string,
    bundlerUrl: string,
    to_address: string,
    value: string,
    data: string,
    delegateCall: boolean,
    signer: Object,
    config: Object,
    paymasterUrl?: string,
    address?: string,
  ): Promise<string>

  /**
   * @return the signature of the user operation in hex format
   */
  signUserOperation(
    chainId: number,
    rpcUrl: string,
    bundlerUrl: string,
    sender: string,
    nonce: string,
    factory: string,
    factoryData: string,
    callData: string,
    preVerificationGas: string,
    callGasLimit: string,
    verificationGasLimit: string,
    maxFeePerGas: string,
    maxPriorityFeePerGas: string,
    paymaster: string,
    paymasterData: string,
    paymasterVerificationGasLimit: string,
    paymasterPostOpGasLimit: string,
    signature: string,
    signer: Object,
    config: Object,
    address?: string,
  ): Promise<string>

  getOwners(
    chainId: number,
    rpcUrl: string,
    bundlerUrl: string,
    signer: Object,
    config: Object,
    address?: string,
  ): Promise<Array<string>>

  isDeployed(
    chainId: number,
    rpcUrl: string,
    bundlerUrl: string,
    signer: Object,
    config: Object,
    address?: string,
  ): Promise<boolean>

  addOwner(
    chainId: number,
    rpcUrl: string,
    bundlerUrl: string,
    owner: string,
    signer: Object,
    config: Object,
    paymasterUrl?: string,
    address?: string,
  ): Promise<string>

  predictAddress(
    rpcUrl: string,
    signer: Object,
  ): Promise<string>

  prepareUserOperation(
    chainId: number,
    rpcUrl: string,
    bundlerUrl: string,
    to_address: string,
    value: string,
    data: string,
    delegateCall: boolean,
    signer: Object,
    config: Object,
    paymasterUrl?: string,
    address?: string,
  ): Promise<Object>

}

export default TurboModuleRegistry.get<Spec>("RTN4337") as Spec | null;
