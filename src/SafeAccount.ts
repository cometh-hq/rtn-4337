import { defaultConfig, SafeConfig, verifyConfig } from "./SafeConfig";
import { isValidEthereumAddress, isValidHex } from "./Utils";
import rtn4337Module from "./rtn4337Module";
import { EOASigner } from "./signer/EOASigner";
import { PasskeySigner } from "./signer/PasskeySigner";
import { UserOperation } from "./types/UserOperation";

class SafeAccount {
  private chainId: number;
  private address?: string;
  private rpcUrl: string;
  private bundlerUrl: string;
  private paymasterUrl?: string;
  private signer: PasskeySigner | EOASigner;
  private config: SafeConfig;

  constructor({
    chainId,
    rpcUrl,
    bundlerUrl,
    signer,
    paymasterUrl,
    address,
    safeConfig = defaultConfig,
  }: {
    chainId: number;
    rpcUrl: string;
    bundlerUrl: string;
    signer: PasskeySigner | EOASigner;
    paymasterUrl?: string;
    address?: string;
    safeConfig?: SafeConfig;
  }) {
    this.chainId = chainId;
    this.rpcUrl = rpcUrl;
    this.bundlerUrl = bundlerUrl;
    this.paymasterUrl = paymasterUrl;
    this.signer = signer;
    if (address && !isValidEthereumAddress(address))
      throw new Error("address is not a valid ethereum address");
    this.address = address;
    verifyConfig(safeConfig);
    this.config = { ...defaultConfig, ...safeConfig };
  }

  private getCommonParams(): CommonParams {
    return {
      chainId: this.chainId,
      rpcUrl: this.rpcUrl,
      bundlerUrl: this.bundlerUrl,
      config: this.config,
      address: this.address,
      paymasterUrl: this.paymasterUrl,
      signer: {
        ...(this.signer instanceof PasskeySigner && { rpId: this.signer.rpId }),
        ...(this.signer instanceof PasskeySigner && {
          userName: this.signer.userName,
        }),
        ...(this.signer instanceof EOASigner && {
          privateKey: this.signer.privateKey,
        }),
      },
    };
  }

  sendUserOperation(
    to_address: string,
    value: string,
    data: string,
    delegateCall: boolean = false,
  ): Promise<string> {
    return rtn4337Module.sendUserOperation(
      this.getCommonParams(),
      to_address,
      value,
      data,
      delegateCall,
    );
  }

  signUserOperation(userOp: UserOperation): Promise<string> {
    isValidUserOp(userOp);
    return rtn4337Module.signUserOperation(this.getCommonParams(), userOp);
  }

  getOwners(): Promise<string[]> {
    return rtn4337Module.getOwners(this.getCommonParams());
  }

  getConfig(): SafeConfig {
    return this.config;
  }

  isDeployed(): Promise<boolean> {
    return rtn4337Module.isDeployed(this.getCommonParams());
  }

  addOwner(owner: string): Promise<string> {
    if (!isValidEthereumAddress(owner))
      throw new Error("owner is not a valid ethereum address");
    return rtn4337Module.addOwner(this.getCommonParams(), owner);
  }

  prepareUserOperation(
    to_address: string,
    value: string,
    data: string,
    delegateCall: boolean = false,
  ): Promise<UserOperation> {
    return rtn4337Module
      .prepareUserOperation(
        this.getCommonParams(),
        to_address,
        value,
        data,
        delegateCall,
      )
      .then((result) => result as UserOperation);
  }
}

/*
    public var sender: String
    public var nonce: String
    public var factory: String?
    public var factoryData: String?
    public var callData: String
    
    public var preVerificationGas: String
    public var callGasLimit: String
    public var verificationGasLimit: String
    
    public var maxFeePerGas: String
    public var maxPriorityFeePerGas: String
    
    public var paymaster: String?
    public var paymasterData: String?
    public var paymasterVerificationGasLimit: String?
    public var paymasterPostOpGasLimit: String?

    public var signature: String
*/
const isValidUserOp = (userOp: UserOperation) => {
  // check if sender not null/undefined
  if (!userOp.sender || !isValidEthereumAddress(userOp.sender))
    throw new Error("Invalid sender address");
  if (!userOp.nonce || !isValidHex(userOp.nonce))
    throw new Error("Invalid nonce");
  if (userOp.factory && !isValidEthereumAddress(userOp.factory))
    throw new Error("Invalid factory address");
  if (userOp.factoryData && !isValidHex(userOp.factoryData))
    throw new Error("Invalid factory data");
  if (!userOp.callData || !isValidHex(userOp.callData))
    throw new Error("Invalid call data");
  if (!userOp.preVerificationGas || !isValidHex(userOp.preVerificationGas))
    throw new Error("Invalid preVerificationGas");
  if (!userOp.callGasLimit || !isValidHex(userOp.callGasLimit))
    throw new Error("Invalid callGasLimit");
  if (!userOp.verificationGasLimit || !isValidHex(userOp.verificationGasLimit))
    throw new Error("Invalid verificationGasLimit");
  if (!userOp.maxFeePerGas || !isValidHex(userOp.maxFeePerGas))
    throw new Error("Invalid maxFeePerGas");
  if (!userOp.maxPriorityFeePerGas || !isValidHex(userOp.maxPriorityFeePerGas))
    throw new Error("Invalid maxPriorityFeePerGas");
  if (userOp.paymaster && !isValidEthereumAddress(userOp.paymaster))
    throw new Error("Invalid paymaster address");
  if (userOp.paymasterData && !isValidHex(userOp.paymasterData))
    throw new Error("Invalid paymaster data");
  if (
    userOp.paymasterVerificationGasLimit &&
    !isValidHex(userOp.paymasterVerificationGasLimit)
  )
    throw new Error("Invalid paymasterVerificationGasLimit");
  if (
    userOp.paymasterPostOpGasLimit &&
    !isValidHex(userOp.paymasterPostOpGasLimit)
  )
    throw new Error("Invalid paymasterPostOpGasLimit");
  if (!userOp.signature || !isValidHex(userOp.signature))
    throw new Error("Invalid signature");
};

export { SafeAccount };

type CommonParams = {
  chainId: number;
  rpcUrl: string;
  bundlerUrl: string;
  config: SafeConfig;
  address?: string;
  paymasterUrl?: string;
  signer?: { rpId?: string; userName?: string; privateKey?: string };
};
