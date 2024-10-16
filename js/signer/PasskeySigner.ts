import NativeRTN4337 from "../NativeRTN4337";
import {Passkey} from "./Passkey";

export class PasskeySigner {
  rpId: string
  userName: string
  passkey: Passkey

  private constructor(rpId: string, userName: string) {
    this.rpId = rpId
    this.userName = userName
  }

  static create(rpId: string, userName: string): Promise<PasskeySigner> {
    const signer = new PasskeySigner(rpId, userName)
    return NativeRTN4337
      .createPasskeySigner(rpId, userName)
      .then(passkey => {
        signer.passkey = passkey as Passkey
        return signer
      })
  }

}
