require("dotenv").config();
import express from "express";
import { setupClient } from "./cosmwasm";
import {
  deleteAllRules,
  getAllRules,
  setRules,
  streamConnect,
} from "./utils/filtered_stream";
const app = express();
const port = 8080;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, async () => {
  console.log(`ICNS verifier listening on port ${port}`);

  const previousRules = await getAllRules();
  console.log("Previous rules:", previousRules);
  await deleteAllRules(previousRules);

  await setRules();
  const currentRules = await getAllRules();
  console.log("Current rules:", currentRules);

  console.log();
  console.log("Now listening for tweets");
  console.log("------------------------");
  console.log();
  const { cosmwasmClient, osmosisAddress } = await setupClient();
  // TODO: Listen for requests and verify
  streamConnect(0);
});
