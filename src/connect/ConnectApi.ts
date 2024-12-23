import rtn4337Module from "../rtn4337Module";

type DeviceData = {
  browser: string;
  os: string;
  platform: string;
};

type CommonParams = {
  apiKey: string;
  baseUrl: string;
  chainId: number;
};

class ConnectApi {
  private apiKey: string;
  private baseUrl: string;
  private chainId: number;

  constructor(apiKey: string, baseUrl: string, chainId: number) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.chainId = chainId;
  }

  initWallet({
    walletAddress,
    initiatorAddress,
    publicKeyId,
    publicKeyX,
    publicKeyY,
    deviceData,
  }: {
    walletAddress: string;
    initiatorAddress: string;
    publicKeyId?: string;
    publicKeyX?: string;
    publicKeyY?: string;
    deviceData?: DeviceData;
  }): Promise<any> {
    return rtn4337Module.connectApiInitWallet(
      this.getCommonParams(),
      walletAddress,
      initiatorAddress,
      publicKeyId,
      publicKeyX,
      publicKeyY,
      deviceData,
    );
  }

  // createWebAuthnSigner
  createWebAuthnSigner({
    walletAddress,
    publicKeyId,
    publicKeyX,
    publicKeyY,
    deviceData,
    signerAddress,
  }: {
    walletAddress: string;
    publicKeyId: string;
    publicKeyX: string;
    publicKeyY: string;
    deviceData: DeviceData;
    signerAddress: string;
  }): Promise<any> {
    return rtn4337Module.connectApiCreateWebAuthnSigner(
      this.getCommonParams(),
      walletAddress,
      publicKeyId,
      publicKeyX,
      publicKeyY,
      deviceData,
      signerAddress,
    );
  }

  getPasskeySignersByWalletAddress({
    walletAddress,
  }: {
    walletAddress: string;
  }): Promise<any> {
    return rtn4337Module.connectApiGetPasskeySignersByWalletAddress(
      this.getCommonParams(),
      walletAddress,
    );
  }

  //IsValidSignature
  isValidSignature({
    walletAddress,
    message,
    signature,
  }: {
    walletAddress: string;
    message: string;
    signature: string;
  }): Promise<any> {
    return rtn4337Module.connectApiIsValidSignature(
      this.getCommonParams(),
      walletAddress,
      message,
      signature,
    );
  }

  private getCommonParams(): CommonParams {
    return {
      apiKey: this.apiKey,
      baseUrl: this.baseUrl,
      chainId: this.chainId,
    };
  }
}

export { ConnectApi };
