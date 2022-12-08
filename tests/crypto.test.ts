import { createECDSASignerFromMnemonic, hashSha256 } from "../src/utils/crypto";

describe("crypto", () => {
  it("test mnemonic", () => {
    const signer = createECDSASignerFromMnemonic(
      "access sure captain marine office finish cry shop patient vicious filter need",
      `m/44'/1356'/0'/0/0`,
    );

    expect(Buffer.from(signer.getSecp256k1PublicKey()).toString("hex")).toBe(
      "02cd371c8c3fd3bbd0a98f30731a6f7244a5bc42aa80ac3fa39ba60b324c4e867f",
    );
  });

  it("sha256", () => {
    expect(hashSha256(Buffer.from("12345678", "hex")).toString("hex")).toBe(
      "b2ed992186a5cb19f6668aade821f502c1d00970dfd0e35128d51bac4649916c",
    );

    expect(hashSha256("string").toString("hex")).toBe(
      "473287f8298dba7163a897908958f7c0eae733e25d2e027992ea2edc9bed2fa8",
    );
  });
});
