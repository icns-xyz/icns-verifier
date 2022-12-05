import { Level } from "level";

const db = new Level("verifiedAuthTokens", { valueEncoding: "json" });

export async function markAsVerified(authToken: string) {
  await db.put(authToken, "true");
}

export async function checkVerified(authToken: string) {
  try {
    const value = await db.get(authToken);
    return !!value;
  } catch (error: any) {
    if (error.code === "LEVEL_NOT_FOUND") {
      return false;
    } else {
      throw error;
    }
  }
}
