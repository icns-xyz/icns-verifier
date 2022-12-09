import { program } from "commander";
import express from "express";
import process from "process";

import verifyTwitterRoutes from "./routes/verifyTwitter";
import { createECDSASignerFromMnemonic } from "./utils/crypto";
import { createAuthTokenLevelDB } from "./utils/db";

program
  .option("--mnemonic [words]", "Verifier mnemonic")
  .option("--port [number]", "Port to open", "8080")
  .option(
    "--path [path]",
    "Path where DB data or config will be located (default: ~/.icns-verifier)",
    "~/.icns-verifier",
  );

program.parse();

const options = program.opts();
const mnemonic = ((): string => {
  if (options.mnemonic) {
    return options.mnemonic;
  }

  const { VERIFIER_MNEMONIC } = process.env;
  if (!VERIFIER_MNEMONIC) {
    console.log(
      "mnemonic must be defined in argument(--mnemonic) or environment(VERIFIER_MNEMONIC)",
    );
    process.exit(1);
  }
  return VERIFIER_MNEMONIC;
})();
const port = ((): number => {
  const num = Number.parseInt(options.port);
  if (num.toString() !== options.port) {
    throw new Error("Invalid port");
  }
  return num;
})();

const signer = createECDSASignerFromMnemonic(mnemonic);
console.log(
  "Your Pubkey is:",
  Buffer.from(signer.getSecp256k1PublicKey()).toString("base64"),
);

const app = express();

app.use(express.json());
app.use(
  "/api",
  verifyTwitterRoutes(signer, createAuthTokenLevelDB(options.path)),
);

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  console.log(`ICNS verifier listening on port ${port}.`);
});
