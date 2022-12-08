import { ec } from "elliptic";
import { verifyTwitter } from "../src/routes/verifyTwitter";
import {ECDSASigner, hashSha256} from "../src/utils/crypto";
import { getTwitterUsername } from "../src/utils/twitter";
import * as process from "process";

jest.mock("../src/utils/twitter");
const getTwitterUsernameMock = getTwitterUsername as jest.MockedFunction<
  typeof getTwitterUsername
>;

function createMockRequest(name: string) {
  return {
    // TODO: Add other msg fields
    msg: JSON.stringify({ name }),
    authToken: "authToken",
  };
}

describe("/verify_twitter", () => {
  const TEST_PRIVATE_KEY = "privateKey"

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env.VERIFIER_PRIVATE_KEY = TEST_PRIVATE_KEY
  });

  afterAll(() => {
    // Restore old environment
    delete process.env.VERIFIER_PRIVATE_KEY
  });

  it("fails on falsy username", () => {
    getTwitterUsernameMock.mockResolvedValueOnce(null);
    expect(() =>
      verifyTwitter(createMockRequest("alice"), "privateKey")
    ).rejects.toThrowError("Twitter user not found.");
    getTwitterUsernameMock.mockResolvedValueOnce("");
    expect(() =>
      verifyTwitter(createMockRequest("alice"), "privateKey")
    ).rejects.toThrowError("Twitter user not found.");
    getTwitterUsernameMock.mockResolvedValueOnce(undefined!);
    expect(() =>
      verifyTwitter(createMockRequest("alice"), "privateKey")
    ).rejects.toThrowError("Twitter user not found.");
  });

  it("fails on mismatched username", () => {
    getTwitterUsernameMock.mockResolvedValueOnce("bob");
    expect(() =>
      verifyTwitter(createMockRequest("alice"), "privateKey")
    ).rejects.toThrowError("Claimer address or name does not match.");
  });

  it("successfully signs msg if verified", async () => {
    getTwitterUsernameMock.mockResolvedValueOnce("alice");
    const request = createMockRequest("alice");
    const response = await verifyTwitter(request, TEST_PRIVATE_KEY);
    expect(response.data.algorithm).toEqual("ecdsa_secp256k1_sha256");
    // Validate signature
    const context = new ec("secp256k1");
    const verifyingKey = context.keyFromPublic(new ECDSASigner(process.env.VERIFIER_PRIVATE_KEY).getSecp256k1PublicKey());
    const signature = Buffer.from(response.data.signature, "base64");
    expect(
      verifyingKey.verify(hashSha256(request.msg), {
        r: signature.slice(0, 32),
        s: signature.slice(32)
      })
    ).toBe(true);
  });
});
