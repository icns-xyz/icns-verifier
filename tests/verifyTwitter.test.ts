import { ec } from "elliptic";
import { verifyTwitter } from "../src/routes/verifyTwitter";
import { hashSha256 } from "../src/utils/crypto";
import { getTwitterUsername } from "../src/utils/twitter";

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
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV, VERIFIER_PRIVATE_KEY: "privateKey" }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
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
    process.env.VERIFIER_PRIVATE_KEY = "privateKey";
    getTwitterUsernameMock.mockResolvedValueOnce("alice");
    const request = createMockRequest("alice");
    const response = await verifyTwitter(request, "privateKey");
    expect(response.algorithm).toEqual("ecdsa_secp256k1_sha256");
    // Validate signature
    const context = new ec("secp256k1");
    const verifyingKey = context.keyFromPublic(response.publicKey);
    expect(
      verifyingKey.verify(hashSha256(request.msg), response.signature)
    ).toBe(true);
  });
});
