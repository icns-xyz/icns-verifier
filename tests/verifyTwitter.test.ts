import { ec } from "elliptic";
import { verifyTwitter } from "../src/routes/verifyTwitter";
import {ECDSASigner, hashSha256} from "../src/utils/crypto";
import { getTwitterUsername } from "../src/utils/twitter";
import {createAuthTokenMemDB} from "../src/utils/db";

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
  const signer = new ECDSASigner(Buffer.from(TEST_PRIVATE_KEY))

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
  });

  it("fails on falsy username", async () => {
    getTwitterUsernameMock.mockResolvedValueOnce(null);
    let data:{ status: number; data: {   signature: string;
      algorithm: string; } | null; errors: string[] } = await verifyTwitter(createMockRequest("alice"), signer, createAuthTokenMemDB())
    expect(data).toStrictEqual({
      status: 404,
      errors: ["Twitter user not found."],
      data: null,
    });
    getTwitterUsernameMock.mockResolvedValueOnce("");
    data = await verifyTwitter(createMockRequest("alice"), signer, createAuthTokenMemDB());
    expect(data).toStrictEqual({
      status: 404,
      errors: ["Twitter user not found."],
      data: null,
    })
    getTwitterUsernameMock.mockResolvedValueOnce(undefined!);
    data = await verifyTwitter(createMockRequest("alice"), signer, createAuthTokenMemDB());
    expect(data).toStrictEqual({
      status: 404,
      errors: ["Twitter user not found."],
      data: null,
    })
  });

  it("fails on mismatched username", async () => {
    getTwitterUsernameMock.mockResolvedValueOnce("bob");
    let data:{ status: number; data: {   signature: string;
        algorithm: string; } | null; errors: string[] } = await verifyTwitter(createMockRequest("alice"), signer, createAuthTokenMemDB())
    expect(
        data
    ).toStrictEqual({
      status: 400,
      errors: ["Claimer address or name does not match."],
      data: null,
    })
  });

  it("successfully signs msg if verified", async () => {
    getTwitterUsernameMock.mockResolvedValueOnce("alice");
    const request = createMockRequest("alice");
    const response = await verifyTwitter(request, signer, createAuthTokenMemDB());
    expect(response.data.algorithm).toEqual("ecdsa_secp256k1_sha256");
    // Validate signature
    const context = new ec("secp256k1");
    const verifyingKey = context.keyFromPublic(signer.getSecp256k1PublicKey());
    const signature = Buffer.from(response.data.signature, "base64");
    expect(
      verifyingKey.verify(hashSha256(request.msg), {
        r: signature.slice(0, 32),
        s: signature.slice(32)
      })
    ).toBe(true);
  });
});
