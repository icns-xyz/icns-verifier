import assert from "assert";

const needle = require("needle");

interface TwitterUser {
  created_at: string;
  id: string;
  name: string;
  username: string;
}

interface TweetData {
  author_id: string;
  edit_history_tweet_ids: string[];
  id: string;
  text: string;
}

export interface Tweet {
  data: [TweetData];
  includes: {
    users: TwitterUser[];
  };
}

const { TWITTER_BEARER_TOKEN } = process.env;
assert(!!TWITTER_BEARER_TOKEN, "Must provide TWITTER_BEARER_TOKEN.");

const TWEET_LOOKUP_URL = "https://api.twitter.com/2/tweets";

export async function getTweetById(tweetId: string): Promise<Tweet | null> {
  const params = {
    ids: tweetId,
    expansions: "author_id",
    "tweet.fields": "created_at",
  };

  let response;
  try {
    response = await needle("get", TWEET_LOOKUP_URL, params, {
      headers: {
        "User-Agent": "v2TweetLookupJS",
        authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
      },
    });
  } catch (error) {
    console.error("Tweet lookup request failed.", { error, tweetId });
    return null;
  }

  const { body } = response;
  // Validate response
  if (body?.data?.length && body?.includes?.users?.length) {
    return body as Tweet;
  }
  console.error("Invalid tweet lookup response", { response, tweetId });
  return null;
}
