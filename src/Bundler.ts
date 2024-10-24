import rtn4337Module from "./rtn4337Module";
import UserOperationByHash from "./types/UserOperationByHash";
import UserOperationReceipt from "./types/UserOperationReceipt";

class Bundler {
  private bundlerUrl: string;

  constructor(bundlerUrl: string) {
    this.bundlerUrl = bundlerUrl;
  }

  ethGetUserOperationReceipt(
    userOpHash: string,
  ): Promise<UserOperationReceipt> {
    return rtn4337Module
      .ethGetUserOperationReceipt(this.bundlerUrl, userOpHash)
      .then((obj) => obj as UserOperationReceipt);
  }

  ethGetUserOperationByHash(userOpHash: string): Promise<UserOperationByHash> {
    return rtn4337Module
      .ethGetUserOperationByHash(this.bundlerUrl, userOpHash)
      .then((obj) => obj as UserOperationByHash);
  }
}

export { Bundler };
