import assert from "assert";
import { Request, Response, Router } from "express";

import { ECDSASigner, hashSha256 } from "../utils/crypto";
import { checkVerified, markAsVerified } from "../utils/db";
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

interface ResponseData {
  signature: number[];
  algorithm: string;
}
interface VerifierResponseBody {
  errors: string[];
  data: ResponseData | null;
}

export async function verifyTwitter(
  reqBody: VerifierRequestBody,
  verifierPrivateKey: string
): Promise<{ status: number; data: ResponseData | null; errors: string[] }> {
  const { msg, authToken } = reqBody;
  const { name }: RequestMsgFormat = JSON.parse(msg);

  if (await checkVerified(authToken)) {
    return {
      status: 403,
      errors: ["authToken has already been verified"],
      data: null,
    };
  }

  const usernameFromToken = await getTwitterUsername(authToken);
  if (!usernameFromToken) {
    return {
      status: 404,
      errors: ["Twitter user not found."],
      data: null,
    };
  }

  if (usernameFromToken !== name) {
    return {
      status: 400,
      errors: ["Claimer address or name does not match."],
      data: null,
    };
  }

  const signer = new ECDSASigner(verifierPrivateKey);
  await markAsVerified(authToken);

  return {
    status: 200,
    errors: [],
    data: {
      signature: signer.signSecp256k1(hashSha256(msg)),
      algorithm: "ecdsa_secp256k1_sha256",
    },
  };
}

// Verify ownership of a given Twitter name
router.post(
  "/verify_twitter",
  async (
    req: Request<{}, {}, VerifierRequestBody>,
    res: Response<VerifierResponseBody>
  ) => {
    const { VERIFIER_PRIVATE_KEY } = process.env;
    assert(
      VERIFIER_PRIVATE_KEY,
      "VERIFIER_PRIVATE_KEY must be defined in environment"
    );
    try {
      const { status, data, errors } = await verifyTwitter(
        req.body,
        VERIFIER_PRIVATE_KEY
      );
      res.status(status).send({ errors, data });
    } catch (err: any) {
      res.status(500).send({ errors: [err.toString()], data: null });
    }
  }
);

export default router;
