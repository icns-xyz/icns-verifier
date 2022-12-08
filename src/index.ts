import assert from "assert";

require("dotenv").config();
import express from "express";
import verifyTwitterRoutes from "./routes/verifyTwitter";
import { ECDSASigner } from "./utils/crypto";

const { VERIFIER_PRIVATE_KEY } = process.env;
assert(
  VERIFIER_PRIVATE_KEY,
  "VERIFIER_PRIVATE_KEY must be defined in environment"
);

const signer = new ECDSASigner(VERIFIER_PRIVATE_KEY);
console.log("Your Pubkey is:", Buffer.from(signer.getSecp256k1PublicKey()).toString("base64"));

const app = express();
const port = 8080;

app.use(express.json());
app.use("/api", verifyTwitterRoutes);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  console.log(`ICNS verifier listening on port ${port}.`);
});
