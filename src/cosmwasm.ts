import { AccountData, Secp256k1HdWallet } from "@cosmjs/amino";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export default class CosmWasmClient {
  claimNameContractAddress: string;
  private _signingClient: SigningCosmWasmClient | null;
  private _osmosisAddress: string | null;

  constructor(claimNameContractAddress: string) {
    this.claimNameContractAddress = claimNameContractAddress;
    this._signingClient = null;
    this._osmosisAddress = null;
  }

  isInitialized(): boolean {
    return !!this._signingClient && !!this._osmosisAddress;
  }

  private checkInitialized() {
    if (!this.isInitialized()) {
      throw new Error("Signing client not initialized");
    }
  }

  async initialize(rpcEndpoint: string, seedPhrase: string) {
    const wallet = await Secp256k1HdWallet.fromMnemonic(seedPhrase, {
      prefix: "osmo",
    });

    this._osmosisAddress = (await wallet.getAccounts())[0].address;
    this._signingClient = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet
    );
  }

  async getVerificationRequestById(requestId: string) {
    this.checkInitialized();
    const response = await this._signingClient!.queryContractSmart(
      this.claimNameContractAddress,
      {
        get_verification_address: {
          request_id: requestId,
        },
      }
    );
    return {
      tweetId: response.tweet_id,
      requesterHandle: response.twitter_handle,
      requesterAddress: response.address,
    };
  }

  async verifyRequest(requestId: string, approved: boolean) {
    this.checkInitialized();
    const response = await this._signingClient!.execute(
      this._osmosisAddress!,
      this.claimNameContractAddress,
      {
        verify: {
          request_id: requestId,
          approved,
        },
      },
      "auto"
    );
    return response;
  }
}
