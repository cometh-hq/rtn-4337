import { Passkey } from "./Passkey";
import rtn4337Module from "../rtn4337Module";

export class PasskeySigner {
  private rpId: string;
  private userName: string;
  private fromExisting: boolean;
  private passkey?: Passkey;

  private constructor(
    rpId: string,
    userName: string,
    passkey?: Passkey,
    fromExisting: boolean = false,
  ) {
    this.rpId = rpId;
    this.userName = userName;
    this.passkey = passkey;
    this.fromExisting = fromExisting;
    if (fromExisting && !passkey) {
      throw new Error("passkey must be provided when fromExisting");
    }
  }

  getPasskey(): Passkey | null {
    return this.passkey || null;
  }

  getRpId(): string {
    return this.rpId;
  }

  getUserName(): string {
    return this.userName;
  }

  isFromExisting(): boolean {
    return this.fromExisting;
  }

  static create(rpId: string, userName: string): Promise<PasskeySigner> {
    const signer = new PasskeySigner(rpId, userName);
    return rtn4337Module.createPasskeySigner(rpId, userName).then((passkey) => {
      signer.passkey = passkey as Passkey;
      return signer;
    });
  }

  static fromExisting(
    rpId: string,
    userName: string,
    passkey: Passkey,
  ): PasskeySigner {
    return new PasskeySigner(rpId, userName, passkey, true);
  }
}
