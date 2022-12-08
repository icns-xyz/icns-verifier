import { BNInput, ec } from "elliptic";
import { sha256 } from "sha.js";

const bip32 = require("bip32");
const bip39 = require("bip39");

export function createECDSASignerFromMnemonic(
  mnemonic: string,
  path: string = `m/44'/118'/0'/0/0`,
  password: string = "",
): ECDSASigner {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error("Invalid mnemonic");
  }

  const seed = bip39.mnemonicToSeedSync(mnemonic, password);
  const masterSeed = bip32.fromSeed(seed);
  const hd = masterSeed.derivePath(path);

  const privateKey = hd.privateKey;
  if (!privateKey) {
    throw new Error("null hd key");
  }
  return new ECDSASigner(privateKey);
}

export class ECDSASigner {
  private signingKey: ec.KeyPair;

  constructor(privateKey: Uint8Array) {
    const context = new ec("secp256k1");
    this.signingKey = context.keyFromPrivate(privateKey);
  }

  signSecp256k1(message: BNInput): Uint8Array {
    const signature = this.signingKey.sign(message, {
      canonical: true,
    });

    return new Uint8Array(
      signature.r.toArray("be", 32).concat(signature.s.toArray("be", 32)),
    );
  }

  getSecp256k1PublicKey(): Uint8Array {
    // Compressed format is more handy because icns-registrar contract accepts compressed format public key.
    return new Uint8Array(this.signingKey.getPublic().encode("array", true));
  }
}

export function hashSha256(message: string | Uint8Array) {
  return new sha256().update(message).digest();
}
