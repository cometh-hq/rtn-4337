import NativeRTN4337 from "./NativeRTN4337";
import UserOperationReceipt from "./types/UserOperationReceipt";
import UserOperationByHash from "./types/UserOperationByHash";

class Bundler {
  private bundlerUrl: string

  constructor(bundlerUrl: string) {
    this.bundlerUrl = bundlerUrl
  }

  ethGetUserOperationReceipt(userOpHash: string): Promise<UserOperationReceipt> {
    return NativeRTN4337
      .ethGetUserOperationReceipt(this.bundlerUrl, userOpHash)
      .then((obj) => obj as UserOperationReceipt)
  }

  ethGetUserOperationByHash(userOpHash: string): Promise<UserOperationByHash> {
    return NativeRTN4337
      .ethGetUserOperationByHash(this.bundlerUrl, userOpHash)
      .then((obj) => obj as UserOperationByHash)
  }
}

export {
  Bundler
}
