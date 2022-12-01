import { Level } from "level";

const db = new Level("verifiedAuthTokens", { valueEncoding: "json" });

export async function markAsVerified(authToken: string) {
  await db.put(authToken, "true");
}

export async function checkVerified(authToken: string) {
  const value = await db.get(authToken);
  return !!value;
}
