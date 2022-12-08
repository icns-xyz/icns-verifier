import { BNInput, ec } from "elliptic";
import { sha256 } from "sha.js";

export class ECDSASigner {
  private signingKey: ec.KeyPair;

  constructor(privateKey: string) {
    const context = new ec("secp256k1");
    this.signingKey = context.keyFromPrivate(privateKey);
  }

  signSecp256k1(message: BNInput):Uint8Array {
    const signature = this.signingKey.sign(message, {
      canonical: true,
    });

    return new Uint8Array(
      signature.r.toArray("be", 32).concat(signature.s.toArray("be", 32))
    );
  }

  getSecp256k1PublicKey():Uint8Array {
    // Compressed format is more handy because icns-registrar contract accepts compressed format public key.
    return new Uint8Array(this.signingKey.getPublic().encode("array", true));
  }
}

export function hashSha256(message: string) {
  return new sha256().update(message).digest();
}
