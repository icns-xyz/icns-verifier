import assert from "assert";
import { Request, Router } from "express";

import { ECDSASigner, hashSha256 } from "../utils/crypto";
import { getTwitterUsername } from "../utils/twitter";
const router = Router();

interface VerifierRequestBody {
  msg: string;
  // OAuth 2.0 user access token fetched from Twitter
  // https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token
  authToken: string;
}

interface RequestMsgFormat {
  name: string;
  claimer: string;
  contract_address: string;
  chain_id: string;
}

export async function verifyTwitter(
  reqBody: VerifierRequestBody,
  verifierPrivateKey: string
) {
  const { msg, authToken } = reqBody;
  const { name }: RequestMsgFormat = JSON.parse(msg);

  const usernameFromToken = await getTwitterUsername(authToken);
  if (!usernameFromToken) {
    throw new Error("Twitter user not found.");
  }

  if (usernameFromToken !== name) {
    console.error("Claimer address or name does not match.", {
      usernameFromToken,
      name,
    });
    throw new Error("Claimer address or name does not match.");
  }

  const signer = new ECDSASigner(verifierPrivateKey);

  return {
    signature: signer.signSecp256k1(hashSha256(msg)),
    publicKey: signer.getSecp256k1PublicKey(),
    algorithm: "ecdsa_secp256k1_sha256",
  };
}

// Verify ownership of a given Twitter name
router.post(
  "/verify_twitter",
  async (req: Request<{}, {}, VerifierRequestBody>, res) => {
    const { VERIFIER_PRIVATE_KEY } = process.env;
    assert(
      VERIFIER_PRIVATE_KEY,
      "VERIFIER_PRIVATE_KEY must be defined in environment"
    );
    try {
      const signedResponse = await verifyTwitter(
        req.body,
        VERIFIER_PRIVATE_KEY
      );
      res.status(200).send(signedResponse);
    } catch (err: any) {
      res.status(400).send(err);
    }
  }
);

export default router;
