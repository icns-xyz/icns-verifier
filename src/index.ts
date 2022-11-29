require("dotenv").config();
import express, { Request } from "express";
import { getTweetIdFromUrl, parseTweet } from "./utils/parsing";
import {
  getSecp256k1PublicKey,
  hashSha256,
  signSecp256k1,
} from "./utils/crypto";
import { getTweetById } from "./utils/twitter";
const app = express();
const port = 8080;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

interface VerifierRequest {
  msg: string;
  tweet_url: string;
}

interface RequestMsgFormat {
  name: string;
  claimer: string;
  contract_address: string;
  chain_id: string;
}

app.post(
  "/verify_twitter",
  async (req: Request<{}, {}, VerifierRequest>, res) => {
    const { msg, tweet_url } = req.body;
    const { name, claimer }: RequestMsgFormat = JSON.parse(msg);

    const tweetId = getTweetIdFromUrl(tweet_url);
    const tweet = await getTweetById(String(tweetId));
    if (!tweet) {
      res.status(404).send("Tweet not found.");
      return;
    }

    const { osmosisAddress, twitterHandle } = parseTweet(tweet);
    const isVerified = osmosisAddress === claimer && twitterHandle === name;
    if (!isVerified) {
      res.status(401).send("Claimer address or name does not match.");
      return;
    }

    res.send({
      signature: signSecp256k1(hashSha256(msg)),
      publicKey: getSecp256k1PublicKey(),
      algorithm: "ecdsa_secp256k1_sha256",
    });
  }
);

app.listen(port, async () => {
  console.log(`ICNS verifier listening on port ${port}.`);
});
