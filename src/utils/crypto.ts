import { BNInput, ec } from "elliptic";
import { sha256 } from "sha.js";

export class ECDSASigner {
  private signingKey: ec.KeyPair;

  constructor(privateKey: string) {
    const context = new ec("secp256k1");
    this.signingKey = context.keyFromPrivate(privateKey);
  }

  signSecp256k1(message: BNInput) {
    return this.signingKey.sign(message).toDER();
  }

  getSecp256k1PublicKey() {
    return this.signingKey.getPublic().encode("array", false);
  }
}

export function hashSha256(message: string) {
  return new sha256().update(message).digest();
}
