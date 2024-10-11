import NativeRTN4337 from "./NativeRTN4337";
import {UserOp} from "./types/UserOp";
import {PasskeySigner} from "./signer/PasskeySigner";
import {EOASigner} from "./signer/EOASigner";
import {SafeConfig, verifyConfig} from "./SafeConfig";
import {isValidEthereumAddress, isValidHex} from "./Utils";

const defaultConfig: SafeConfig = {
  safeModuleSetupAddress: "0x2dd68b007B46fBe91B9A7c3EDa5A7a1063cB5b47",
  safe4337ModuleAddress: "0x75cf11467937ce3F2f357CE24ffc3DBF8fD5c226",
  safeSingletonL2Address: "0x29fcB43b46531BcA003ddC8FCB67FFE91900C762",
  safeProxyFactoryAddress: "0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67",
  safeWebAuthnSharedSignerAddress: "0xfD90FAd33ee8b58f32c00aceEad1358e4AFC23f9",
  safeMultiSendAddress: "0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526",
  safeP256VerifierAddress: "0x445a0683e494ea0c5AF3E83c5159fBE47Cf9e765",
  safeWebauthnSignerFactoryAddress: "0xF7488fFbe67327ac9f37D5F722d83Fc900852Fbf"
}

class SafeAccount {
  private chainId: number
  private address: string
  private rpcUrl: string
  private bundlerUrl: string
  private paymasterUrl?: string
  private signer: PasskeySigner | EOASigner
  private config: SafeConfig

  constructor(
    chainId: number,
    rpcUrl: string,
    bundlerUrl: string,
    signer: PasskeySigner | EOASigner,
    paymasterUrl?: string,
    address?: string,
    safeConfig: SafeConfig = defaultConfig
  ) {
    this.chainId = chainId;
    this.rpcUrl = rpcUrl;
    this.bundlerUrl = bundlerUrl;
    this.paymasterUrl = paymasterUrl;
    this.signer = signer;
    // check it's an address
    if (address && !isValidEthereumAddress(address)) throw new Error("address is not a valid ethereum address")
    this.address = address
    verifyConfig(safeConfig)
    this.config = {...defaultConfig, ...safeConfig}
  }

  sendUserOperation(to_address: string, value: string, data: string, delegateCall: boolean = false) {
    return NativeRTN4337.sendUserOperation(
      this.chainId, this.rpcUrl, this.bundlerUrl,
      to_address,
      value,
      data,
      delegateCall,
      this.signer,
      this.config,
      this.paymasterUrl,
      this.address
    );
  }

  signUserOperation(userOp: UserOp) {
    isValidUserOp(userOp);
    return NativeRTN4337.signUserOperation(
      this.chainId, this.rpcUrl, this.bundlerUrl,
      userOp.sender,
      userOp.nonce,
      userOp.factory,
      userOp.factoryData,
      userOp.callData,
      userOp.preVerificationGas,
      userOp.callGasLimit,
      userOp.verificationGasLimit,
      userOp.maxFeePerGas,
      userOp.maxPriorityFeePerGas,
      userOp.paymaster,
      userOp.paymasterData,
      userOp.paymasterVerificationGasLimit,
      userOp.paymasterPostOpGasLimit,
      userOp.signature,
      this.signer,
      this.config,
      this.address
    );
  }

  getOwners() {
    return NativeRTN4337.getOwners(this.chainId, this.rpcUrl, this.bundlerUrl, this.signer)
  }

  getConfig() {
    return this.config
  }

}

// check userOp
const isValidUserOp = (userOp: UserOp) => {
  if (!isValidEthereumAddress(userOp.sender)) throw new Error("Invalid sender address")
  if (!isValidHex(userOp.nonce)) throw new Error("Invalid nonce")
  if (!isValidEthereumAddress(userOp.factory)) throw new Error("Invalid factory address")
  if (!isValidHex(userOp.factoryData)) throw new Error("Invalid factory data")
  if (!isValidHex(userOp.callData)) throw new Error("Invalid call data")
  if (!isValidHex(userOp.preVerificationGas)) throw new Error("Invalid pre verification gas")
  if (!isValidHex(userOp.callGasLimit)) throw new Error("Invalid call gas limit")
  if (!isValidHex(userOp.verificationGasLimit)) throw new Error("Invalid verification gas limit")
  if (!isValidHex(userOp.maxFeePerGas)) throw new Error("Invalid max fee per gas")
  if (!isValidHex(userOp.maxPriorityFeePerGas)) throw new Error("Invalid max priority fee per gas")
  if (!isValidEthereumAddress(userOp.paymaster)) throw new Error("Invalid paymaster address")
  if (!isValidHex(userOp.paymasterData)) throw new Error("Invalid paymaster data")
  if (!isValidHex(userOp.paymasterVerificationGasLimit)) throw new Error("Invalid paymaster verification gas limit")
  if (!isValidHex(userOp.paymasterPostOpGasLimit)) throw new Error("Invalid paymaster post op gas limit")
  if (!isValidHex(userOp.signature)) throw new Error("Invalid signature")
}


export default SafeAccount;
