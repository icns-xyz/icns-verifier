import { Level } from "level";
import os from "os";
import Path from "path";

export interface AuthTokenDB {
  markAsVerified(authToken: string): Promise<void>;
  checkVerified(authToken: string): Promise<boolean>;
}

export function createAuthTokenLevelDB(path: string): AuthTokenDB {
  path = Path.normalize(path);
  const paths = path.split("/");
  // Make tilde(~) to absolute manually if exists.
  if (paths.length > 0 && paths[0] === "~") {
    path = Path.join(os.homedir(), ...paths.slice(1));
  }

  path = Path.resolve(path, "data");

  if (!Path.isAbsolute(path)) {
    throw new Error(`Please provide absolute path for DB: ${path}`);
  }

  const db = new Level(path, {
    valueEncoding: "json",
  });

  return {
    markAsVerified: (authToken: string): Promise<void> => {
      return db.put(authToken, "true");
    },
    checkVerified: async (authToken: string): Promise<boolean> => {
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
    },
  };
}

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
