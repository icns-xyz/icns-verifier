import assert from "assert";
import { parseTweet } from "./parsing";

const needle = require("needle");

const bearerToken = process.env.TWITTER_BEARER_TOKEN;
assert(!!bearerToken, "Must provide TWITTER_BEARER_TOKEN.");

const rulesURL = "https://api.twitter.com/2/tweets/search/stream/rules";
const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?expansions=author_id";

interface TweetRule {
  value: string;
  tag: string;
}

interface TweetRuleResponse extends TweetRule {
  id: string;
}

interface FitleredStreamRules {
  data?: TweetRuleResponse[];
}

const rules: TweetRule[] = [
  {
    value: '"I am claiming the #ICNS name " " for "',
    tag: "claim icns",
  },
];

export async function getAllRules(): Promise<FitleredStreamRules> {
  const response = await needle("get", rulesURL, {
    headers: {
      authorization: `Bearer ${bearerToken}`,
    },
  });

  if (response.statusCode !== 200) {
    console.log("Error:", response.statusMessage, response.statusCode);
    throw new Error(response.body);
  }

  return response.body;
}

export async function deleteAllRules(rules: FitleredStreamRules) {
  if (!rules.data) {
    return;
  }
  const ids = rules.data.map((rule) => rule.id);

  const data = {
    delete: {
      ids: ids,
    },
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${bearerToken}`,
    },
  });

  if (response.statusCode !== 200) {
    throw new Error(response.body);
  }

  return response.body;
}

export async function setRules() {
  const data = {
    add: rules,
  };

  const response = await needle("post", rulesURL, data, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${bearerToken}`,
    },
  });

  if (response.statusCode !== 201) {
    throw new Error(response.body);
  }

  return response.body;
}

export function streamConnect(retryAttempt: number) {
  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2FilterStreamJS",
      Authorization: `Bearer ${bearerToken}`,
    },
    timeout: 20000,
  });

  stream
    .on("data", (data: any) => {
      try {
        const json = JSON.parse(data);
        const result = parseTweet(json);
        if (result) {
          const { claimHandle, osmoAddress } = result;
          console.log({ claimHandle, osmoAddress });
          // TODO: Logic to airdrop NFT
        }
        // A successful connection resets retry count.
        retryAttempt = 0;
      } catch (e) {
        if (
          data.detail ===
          "This stream is currently at the maximum allowed connection limit."
        ) {
          console.log(data.detail);
          process.exit(1);
        } else {
          // Keep alive signal received. Do nothing.
        }
      }
    })
    .on("err", (error: any) => {
      if (error.code !== "ECONNRESET") {
        console.log(error.code);
        process.exit(1);
      } else {
        // This reconnection logic will attempt to reconnect when a disconnection is detected.
        // To avoid rate limits, this logic implements exponential backoff, so the wait time
        // will increase if the client cannot reconnect to the stream.
        setTimeout(() => {
          console.warn("A connection error occurred. Reconnecting...");
          streamConnect(++retryAttempt);
        }, 2 ** retryAttempt);
      }
    });

  return stream;
}
