import NativeRTN4337 from "./NativeRTN4337";
import {PasskeySigner} from "./signer/PasskeySigner";
import {EOASigner} from "./signer/EOASigner";

const predictAddress = (rpcUrl: string, signer: PasskeySigner | EOASigner) => {
  return NativeRTN4337.predictAddress(rpcUrl, signer);
}

export {
  predictAddress,
}

