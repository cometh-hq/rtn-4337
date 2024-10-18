
export type UserOperation = {
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
};
