require("dotenv").config();
import assert from "assert";
import express from "express";
import CosmWasmClient from "./cosmwasm";
import { parseTweet } from "./utils/parsing";
import { getTweetById } from "./utils/twitter";
const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const {
  OSMOSIS_RPC_ENDPOINT,
  OSMOSIS_WALLET_MNEMONIC,
  CLAIM_NAME_CONTRACT_ADDRESS,
} = process.env;

assert(!!OSMOSIS_RPC_ENDPOINT, "Must provide OSMOSIS_RPC_ENDPOINT.");
assert(!!OSMOSIS_WALLET_MNEMONIC, "Must provide OSMOSIS_WALLET_MNEMONIC.");
assert(
  !!CLAIM_NAME_CONTRACT_ADDRESS,
  "Must provide CLAIM_NAME_CONTRACT_ADDRESS."
);

const cosmwasmClient = new CosmWasmClient(CLAIM_NAME_CONTRACT_ADDRESS);

app.post("/verify/:requestId", async (req, res) => {
  if (!cosmwasmClient.isInitialized()) {
    res.status(500).send("Waiting on CosmWasm; please try again soon.");
    return;
  }
  const requestId = Number(req.params.requestId);
  const { tweetId, requesterHandle, requesterAddress } =
    await cosmwasmClient.getVerificationRequestById(requestId);
  const tweet = await getTweetById(String(tweetId));
  if (!tweet) {
    res.status(404).send("Tweet not found.");
    return;
  }
  const { osmosisAddress, twitterHandle } = parseTweet(tweet);
  const isVerified =
    osmosisAddress === requesterAddress && twitterHandle === requesterHandle;
  if (isVerified) {
    const verifyResponse = await cosmwasmClient.verifyRequest(requestId, true);
    res.status(200).send(verifyResponse);
  }
  res.status(200).send("Not verified.");
});

app.listen(port, async () => {
  console.log(`ICNS verifier listening on port ${port}.`);
  await cosmwasmClient.initialize(
    OSMOSIS_RPC_ENDPOINT,
    OSMOSIS_WALLET_MNEMONIC
  );
  console.log(`Verifier address: ${cosmwasmClient.osmosisAddress}`);
});
