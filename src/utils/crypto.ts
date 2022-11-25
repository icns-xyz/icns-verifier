import assert from "assert";
import { BNInput, ec } from "elliptic";
import { sha256 } from "sha.js";

const { VERIFIER_PRIVATE_KEY } = process.env;
assert(
  VERIFIER_PRIVATE_KEY,
  "VERIFIER_PRIVATE_KEY must be defined in environment"
);

const context = new ec("secp256k1");
const signingKey = context.keyFromPrivate(VERIFIER_PRIVATE_KEY);

export function signSecp256k1(message: BNInput) {
  return signingKey.sign(message).toDER();
}

export function getSecp256k1PublicKey() {
  return signingKey.getPublic().encode("array", false);
}

export function hashSha256(message: string) {
  return new sha256().update(message).digest();
}
