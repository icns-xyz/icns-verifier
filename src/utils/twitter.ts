const needle = require("needle");

interface TwitterUser {
  created_at?: string;
  id: string;
  name: string;
  username: string;
}

const CURRENT_TWITTER_USER_URL = "https://api.twitter.com/2/users/me";

export async function getTwitterUsername(authToken: string) {
  try {
    const {
      body: { data: user },
    }: { body: { data: TwitterUser } } = await needle(
      "get",
      CURRENT_TWITTER_USER_URL,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return user.username;
  } catch (err) {
    console.error("Could not get Twitter username.", { err });
    return null;
  }
}
