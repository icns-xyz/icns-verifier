import { Request, Response, Router } from "express";

import { ECDSASigner, hashSha256 } from "../utils/crypto";
import { AuthTokenDB } from "../utils/db";
import { getTwitterVerifyingMsg } from "../utils/twitter";

interface VerifierRequestBody {
  claimer: string;
  // OAuth 2.0 user access token fetched from Twitter
  // https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token
  authToken: string;
}

interface ResponseData {
  // JSON string
  verifying_msg: string;
  // Base64 encoded
  public_key: string;
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
  authTokenDB: AuthTokenDB,
  chainId: string,
  contractAddress: string,
): Promise<{ status: number; data: ResponseData | null; errors: string[] }> {
  const { authToken } = reqBody;

  // Normalize base64 padding for db key
  const authTokenForDB = Buffer.from(authToken, "base64").toString("base64");
  if (await authTokenDB.checkVerified(authTokenForDB)) {
    return {
      status: 403,
      errors: ["authToken has already been verified"],
      data: null,
    };
  }

  if (!reqBody.claimer) {
    return {
      status: 400,
      errors: ["claimer is null"],
      data: null,
    };
  }

  const verifyingMsg = await getTwitterVerifyingMsg(
    authToken,
    reqBody.claimer,
    chainId,
    contractAddress,
  );
  if (!verifyingMsg) {
    return {
      status: 404,
      errors: ["Twitter user not found."],
      data: null,
    };
  }

  await authTokenDB.markAsVerified(authTokenForDB);

  const verifyingMsgStr = JSON.stringify(verifyingMsg);

  return {
    status: 200,
    errors: [],
    data: {
      verifying_msg: verifyingMsgStr,
      public_key: Buffer.from(signer.getSecp256k1PublicKey()).toString(
        "base64",
      ),
      signature: Buffer.from(
        signer.signSecp256k1(hashSha256(verifyingMsgStr)),
      ).toString("base64"),
      algorithm: "ecdsa_secp256k1_sha256",
    },
  };
}

export default (
  signer: ECDSASigner,
  authTokenDB: AuthTokenDB,
  chainId: string,
  contractAddress: string,
): Router => {
  const router = Router();

  // Verify ownership of a given Twitter name
  router.post(
    "/verify_twitter",
    async (
      req: Request<{}, {}, VerifierRequestBody>,
      res: Response<VerifierResponseBody>,
    ) => {
      try {
        const { status, data, errors } = await verifyTwitter(
          req.body,
          signer,
          authTokenDB,
          chainId,
          contractAddress,
        );
        res.status(status).send({ errors, data });
      } catch (err: any) {
        res.status(500).send({ errors: [err.toString()], data: null });
      }
    },
  );

  return router;
};
