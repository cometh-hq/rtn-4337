import { Bundler } from "./Bundler";
import UserOperationReceipt from "./types/UserOperationReceipt";

class UserOperationReceiptPoller {
  private bundler: Bundler;
  private timeout: number; // in milliseconds

  constructor(bundler: Bundler, timeout: number = 30000) {
    this.bundler = bundler;
    this.timeout = timeout;
  }

  async waitForReceipt(userOpHash: string): Promise<UserOperationReceipt> {
    const startTime = Date.now();
    let timeoutId: number;

    return new Promise((resolve, reject) => {
      const checkCondition = async () => {
        try {
          const receipt =
            await this.bundler.ethGetUserOperationReceipt(userOpHash);

          if (receipt != null) {
            clearTimeout(timeoutId);
            resolve(receipt);
            return;
          }

          if (Date.now() - startTime >= this.timeout) {
            clearTimeout(timeoutId);
            reject(new Error("Timeout"));
            return;
          }
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
          return;
        }

        timeoutId = setTimeout(checkCondition, 1000);
      };

      checkCondition();
    });
  }
}

export { UserOperationReceiptPoller };
