import {TurboModule, TurboModuleRegistry} from "react-native";

export interface Spec extends TurboModule {
  sendUserOperation(
    chainId: number,
    rpcUrl: string,
    bundlerUrl: string,
    paymasterUrl: string | null,
    to_address: string,
    value: string,
    data: string,
    delegateCall: boolean,
    signer: Object,
    config: Object,
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
  ): Promise<string>

  getOwners(
    chainId: number,
    rpcUrl: string,
    bundlerUrl: string,
    signer: Object,
  ): Promise<Array<string>>

  predictAddress(
    rpcUrl: string,
    signer: Object,
  ): Promise<string>

}

export default TurboModuleRegistry.get<Spec>("RTN4337") as Spec | null;
