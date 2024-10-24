import { Passkey } from "./Passkey";
import rtn4337Module from "../rtn4337Module";

export class PasskeySigner {
  rpId: string;
  userName: string;
  passkey: Passkey | undefined;

  private constructor(rpId: string, userName: string) {
    this.rpId = rpId;
    this.userName = userName;
  }

  static create(rpId: string, userName: string): Promise<PasskeySigner> {
    const signer = new PasskeySigner(rpId, userName);
    console.log("rtn4337Module", JSON.stringify(rtn4337Module));
    console.log("rtn4337Module.COUCOU", JSON.stringify(rtn4337Module.COUCOU));
    return rtn4337Module.createPasskeySigner(rpId, userName).then((passkey) => {
      signer.passkey = passkey as Passkey;
      return signer;
    });
  }
}
