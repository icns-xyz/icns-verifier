require("dotenv").config();
import express from "express";
import verifyTwitterRoutes from "./routes/verifyTwitter";
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
