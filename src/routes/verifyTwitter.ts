import { Request, Response, Router } from "express";

import { ECDSASigner, hashSha256 } from "../utils/crypto";
import {AuthTokenDB} from "../utils/db";
import { getTwitterUsername } from "../utils/twitter";

interface VerifierRequestBody {
  msg: string;
  // OAuth 2.0 user access token fetched from Twitter
  // https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token
  authToken: string;
}

interface RequestMsgFormat {
  unique_twitter_id: string;
  name: string;
  claimer: string;
  contract_address: string;
  chain_id: string;
}

interface ResponseData {
  // Base64 encoded
  signature: string;
  algorithm: string;
}
interface VerifierResponseBody {
  errors: string[];
  data: ResponseData | null;
}

export async function verifyTwitter(
  reqBody: VerifierRequestBody,
  signer: ECDSASigner,
  authTokenDB:AuthTokenDB,
): Promise<{ status: number; data: ResponseData | null; errors: string[] }> {
  const { msg, authToken } = reqBody;
  const { name }: RequestMsgFormat = JSON.parse(msg);

  // Normalize base64 padding
  const safeAuthToken = Buffer.from(authToken, "base64").toString("base64");

  if (await authTokenDB.checkVerified(safeAuthToken)) {
    return {
      status: 403,
      errors: ["authToken has already been verified"],
      data: null,
    };
  }

  const usernameFromToken = await getTwitterUsername(safeAuthToken);
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

  await authTokenDB.markAsVerified(safeAuthToken);

  return {
    status: 200,
    errors: [],
    data: {
      signature: Buffer.from(signer.signSecp256k1(hashSha256(msg))).toString("base64"),
      algorithm: "ecdsa_secp256k1_sha256",
    },
  };
}

export default (signer: ECDSASigner, authTokenDB: AuthTokenDB):Router => {
  const router = Router()

  // Verify ownership of a given Twitter name
  router.post(
    "/verify_twitter",
    async (
      req: Request<{}, {}, VerifierRequestBody>,
      res: Response<VerifierResponseBody>
    ) => {
      try {
        const { status, data, errors } = await verifyTwitter(
          req.body,
          signer,
          authTokenDB,
        );
        res.status(status).send({ errors, data });
      } catch (err: any) {
        res.status(500).send({ errors: [err.toString()], data: null });
      }
    }
  );

  return router
}
