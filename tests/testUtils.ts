import { Tweet } from "../src/utils/twitter";

export function createMockTweet(text: string, username: string): Tweet {
  return {
    data: [
      {
        text,
        author_id: "1",
        edit_history_tweet_ids: [],
        id: "1",
      },
    ],
    includes: {
      users: [
        {
          created_at: "123",
          id: "1",
          name: username,
          username,
        },
      ],
    },
  };
}
