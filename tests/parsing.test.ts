import { parseTweet } from "../src/utils/parsing";
import { createMockTweet } from "./testUtils";

describe("parsing", () => {
  describe("getTweetById", () => {
    it("parses tweet contents correctly", () => {
      const tweet = createMockTweet(
        "I am claiming the #ICNS name @john for osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks",
        "john"
      );
      const { twitterHandle, osmosisAddress } = parseTweet(tweet);
      expect(twitterHandle).toEqual("john");
      expect(osmosisAddress).toEqual(
        "osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks"
      );
    });
    it("case insensitive", () => {
      const tweet = createMockTweet(
        "i am CLAIMING the #icNs name @John FOR osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks",
        "john"
      );
      const { twitterHandle, osmosisAddress } = parseTweet(tweet);
      expect(twitterHandle).toEqual("john");
      expect(osmosisAddress).toEqual(
        "osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks"
      );
    });
    it("can have other text before or after", () => {
      const tweet = createMockTweet(
        "Today I am claiming the #ICNS name @john for osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks. So excited!!!",
        "john"
      );
      const { twitterHandle, osmosisAddress } = parseTweet(tweet);
      expect(twitterHandle).toEqual("john");
      expect(osmosisAddress).toEqual(
        "osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks"
      );
    });
    it("throws error on invalid address", () => {
      const tweet = createMockTweet(
        "I am claiming the #ICNS name @john for osmo1dog",
        "john"
      );
      expect(() => parseTweet(tweet)).toThrowError(
        "Failed to parse Osmosis address."
      );
    });
    it("throws error on invalid format", () => {
      const tweet = createMockTweet(
        "I am claimin' the #ICNS name @john for osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks",
        "john"
      );
      expect(() => parseTweet(tweet)).toThrowError(
        "Does not match correct tweet format."
      );
    });
    it("throws error on mismatched username", () => {
      const tweet = createMockTweet(
        "I am claiming the #ICNS name @john for osmo1cyyzpxplxdzkeea7kwsydadg87357qnahakaks",
        "notjohn"
      );
      expect(() => parseTweet(tweet)).toThrowError(
        "Claimed handle does not match username."
      );
    });
  });
});
