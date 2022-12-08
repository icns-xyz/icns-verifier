import { Level } from "level";

const db = new Level("verifiedAuthTokens", { valueEncoding: "json" });

export interface AuthTokenDB {
  markAsVerified(authToken: string): Promise<void>;
  checkVerified(authToken: string): Promise<boolean>;
}

function markAsVerified(authToken: string): Promise<void> {
  return db.put(authToken, "true");
}

async function checkVerified(authToken: string): Promise<boolean> {
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

export const AuthTokenLevelDB: AuthTokenDB = {
  markAsVerified,
  checkVerified,
};

export function createAuthTokenMemDB(): AuthTokenDB {
  const mem: Record<string, boolean | undefined> = {};

  return {
    markAsVerified(authToken: string): Promise<void> {
      mem[authToken] = true;
      return Promise.resolve();
    },
    checkVerified(authToken: string): Promise<boolean> {
      return Promise.resolve(!!mem[authToken]);
    },
  };
}
