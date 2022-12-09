import express from "express";
import process from "process";

import verifyTwitterRoutes from "./routes/verifyTwitter";
import { createECDSASignerFromMnemonic } from "./utils/crypto";
import { createAuthTokenLevelDB } from "./utils/db";

require("dotenv").config();

const { VERIFIER_MNEMONIC } = process.env;
if (!VERIFIER_MNEMONIC) {
  console.log("VERIFIER_MNEMONIC must be defined in environment");
  process.exit(1);
}

const signer = createECDSASignerFromMnemonic(VERIFIER_MNEMONIC);
console.log(
  "Your Pubkey is:",
  Buffer.from(signer.getSecp256k1PublicKey()).toString("base64"),
);

const app = express();
const port = 8080;

app.use(express.json());
app.use(
  "/api",
  verifyTwitterRoutes(signer, createAuthTokenLevelDB("~/.icns-verifier")),
);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  console.log(`ICNS verifier listening on port ${port}.`);
});
