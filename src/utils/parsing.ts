import { normalizeBech32 } from "@cosmjs/encoding";

interface TwitterUser {
  created_at: string;
  id: string;
  name: string;
  username: string;
}

export interface StreamedTweet {
  data: {
    author_id: string;
    edit_history_tweet_ids: string[];
    id: string;
    text: string;
  };
  includes: {
    users: TwitterUser[];
  };
}

function normalizeTwitterHandle(twitterHandle: string) {
  return twitterHandle.toLowerCase();
}

const CLAIM_ADDRESS_REGEX =
  /I am claiming the #ICNS name @(\w+) for (osmo[a-zA-Z0-9]+)/i;

export function parseTweet(tweet: StreamedTweet) {
  const {
    data: { text, author_id },
    includes: { users },
  } = tweet;
  const matches = text.match(CLAIM_ADDRESS_REGEX);
  if (!matches || matches.length < 3) {
    return null;
  }

  const user = users.find(({ id }) => id === author_id);
  if (!user) {
    console.error(
      "Improperly formatted response -- could not find user object."
    );
    return null;
  }
  const [, rawClaimHandle, rawOsmoAddress] = matches;
  const claimHandle = normalizeTwitterHandle(rawClaimHandle);
  if (claimHandle !== user.username.toLowerCase()) {
    console.error("Claimed handle does not match username.");
    return null;
  }

  let osmoAddress: string;
  try {
    osmoAddress = normalizeBech32(rawOsmoAddress);
  } catch (_e) {
    console.error("Failed to parse Osmosis address.");
    return null;
  }

  return {
    claimHandle,
    osmoAddress,
  };
}
