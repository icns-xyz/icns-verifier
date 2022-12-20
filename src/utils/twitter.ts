interface TwitterUser {
  created_at?: string;
  id: string;
  name: string;
  username: string;
}

interface TwitterVerifyingMsg {
  unique_twitter_id: string;
  name: string;
  claimer: string;
  contract_address: string;
  chain_id: string;
}

const CURRENT_TWITTER_USER_URL = "https://api.twitter.com/2/users/me";

export async function getTwitterVerifyingMsg(
  authToken: string,
  claimer: string,
  chainId: string,
  contractAddress: string,
): Promise<TwitterVerifyingMsg | null> {
  try {
    const fetched = await fetch(CURRENT_TWITTER_USER_URL, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!fetched.ok || fetched.status !== 200) {
      console.error(fetched);
      throw new Error("Failed to fetch twitter user info");
    }

    const res: {
      data: TwitterUser;
    } = await fetched.json();

    console.log("Twitter res:", res);
    return {
      unique_twitter_id: res.data.id,
      name: res.data.username,
      claimer,
      contract_address: contractAddress,
      chain_id: chainId,
    };
  } catch (err) {
    console.error("Could not get Twitter res", { err });
    return null;
  }
}
