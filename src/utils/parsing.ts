import { normalizeBech32 } from "@cosmjs/encoding";
import { Tweet } from "./twitter";

function normalizeTwitterHandle(twitterHandle: string) {
  return twitterHandle.toLowerCase();
}

const CLAIM_ADDRESS_REGEX =
  /I am claiming the #ICNS name @(\w+) for (osmo[a-zA-Z0-9]+)/i;

export function parseTweet(tweet: Tweet) {
  const {
    data: [{ text, author_id }],
    includes: { users },
  } = tweet;
  const matches = text.match(CLAIM_ADDRESS_REGEX);
  if (!matches || matches.length < 3) {
    throw new Error("Does not match correct tweet format.");
  }

  const user = users.find(({ id }) => id === author_id);
  if (!user) {
    throw new Error(
      "Improperly formatted response -- could not find user object."
    );
  }
  const [, rawClaimHandle, rawOsmoAddress] = matches;
  const twitterHandle = normalizeTwitterHandle(rawClaimHandle);
  if (twitterHandle !== user.username.toLowerCase()) {
    throw new Error("Claimed handle does not match username.");
  }

  let osmosisAddress: string;
  try {
    osmosisAddress = normalizeBech32(rawOsmoAddress);
  } catch (_e) {
    throw new Error("Failed to parse Osmosis address.");
  }

  return {
    twitterHandle,
    osmosisAddress,
  };
}

// Tweet IDs are 64-bit unsigned integers, so we match for numbers
// with max 20 decimal digits to prevent greedy matching from crashing
// long, malformed inputs.
// Source: https://developer.twitter.com/en/docs/twitter-ids
const TWITTER_URL_REGEX =
  /^https?:\/\/(www)?twitter.com\/\w+\/status\/([0-9]{1,20})/;

export function getTweetIdFromUrl(tweetUrl: string): string {
  const matches = tweetUrl.match(TWITTER_URL_REGEX);
  if (!matches || matches.length < 3) {
    throw new Error("Improperly formatted tweet URL.");
  }

  const [, , tweetId] = matches;
  return tweetId;
}
