import { ec } from "elliptic";

import { verifyTwitter } from "../src/routes/verifyTwitter";
import { ECDSASigner, hashSha256 } from "../src/utils/crypto";
import { createAuthTokenMemDB } from "../src/utils/db";
import { getTwitterVerifyingMsg } from "../src/utils/twitter";

jest.mock("../src/utils/twitter");
const getTwitterVerifyingMsgMock =
  getTwitterVerifyingMsg as jest.MockedFunction<typeof getTwitterVerifyingMsg>;

function createMockRequest(claimer: string) {
  return {
    claimer,
    authToken: "authToken",
  };
}

describe("/verify_twitter", () => {
  const TEST_PRIVATE_KEY = "privateKey";
  const chainId = "test-1";
  const contractAddress = "contract1";
  const signer = new ECDSASigner(Buffer.from(TEST_PRIVATE_KEY));

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
  });

  it("fails on falsy username", async () => {
    getTwitterVerifyingMsgMock.mockResolvedValueOnce(null);
    let data: {
      status: number;
      data: { signature: string; algorithm: string } | null;
      errors: string[];
    } = await verifyTwitter(
      createMockRequest("alice"),
      signer,
      createAuthTokenMemDB(),
      chainId,
      contractAddress,
    );
    expect(data).toStrictEqual({
      status: 404,
      errors: ["Twitter user not found."],
      data: null,
    });

    data = await verifyTwitter(
      createMockRequest("alice"),
      signer,
      createAuthTokenMemDB(),
      chainId,
      contractAddress,
    );
    expect(data).toStrictEqual({
      status: 404,
      errors: ["Twitter user not found."],
      data: null,
    });
    getTwitterVerifyingMsgMock.mockResolvedValueOnce(undefined!);
    data = await verifyTwitter(
      createMockRequest("alice"),
      signer,
      createAuthTokenMemDB(),
      chainId,
      contractAddress,
    );
    expect(data).toStrictEqual({
      status: 404,
      errors: ["Twitter user not found."],
      data: null,
    });
  });

  it("successfully signs msg if verified", async () => {
    const twitterUsername = "bob";
    const twitterUserId = "123";
    const claimer = "alice";

    getTwitterVerifyingMsgMock.mockResolvedValueOnce({
      unique_twitter_id: twitterUserId,
      name: twitterUsername,
      claimer,
      contract_address: contractAddress,
      chain_id: chainId,
    });
    const request = createMockRequest(claimer);
    const response = await verifyTwitter(
      request,
      signer,
      createAuthTokenMemDB(),
      chainId,
      contractAddress,
    );
    expect(JSON.parse(response.data!.verifying_msg)).toStrictEqual({
      unique_twitter_id: twitterUserId,
      name: twitterUsername,
      claimer,
      contract_address: contractAddress,
      chain_id: chainId,
    });
    expect(response.data?.algorithm).toEqual("ecdsa_secp256k1_sha256");
    // Validate signature
    const context = new ec("secp256k1");
    const verifyingKey = context.keyFromPublic(signer.getSecp256k1PublicKey());
    const signature = Buffer.from(response.data!.signature, "base64");
    expect(
      verifyingKey.verify(hashSha256(response.data!.verifying_msg), {
        r: signature.slice(0, 32),
        s: signature.slice(32),
      }),
    ).toBe(true);
  });
});
