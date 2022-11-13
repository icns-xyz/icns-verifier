import { Secp256k1HdWallet } from "@cosmjs/amino";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Decimal } from "@cosmjs/math";

interface VerificationRequest {
  tweet_id: string;
  twitter_handle: string;
  owner_address: string;
}

interface GetVerificationRequestResponse {
  verification_request: VerificationRequest;
}

export default class CosmWasmClient {
  claimNameContractAddress: string;
  osmosisAddress: string | null;
  private _signingClient: SigningCosmWasmClient | null;

  constructor(claimNameContractAddress: string) {
    this.claimNameContractAddress = claimNameContractAddress;
    this._signingClient = null;
    this.osmosisAddress = null;
  }

  isInitialized(): boolean {
    return !!this._signingClient && !!this.osmosisAddress;
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

    this.osmosisAddress = (await wallet.getAccounts())[0].address;
    this._signingClient = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      wallet,
      {
        gasPrice: { amount: Decimal.one(0), denom: "uosmo" },
      }
    );
  }

  async getVerificationRequestById(requestId: number) {
    this.checkInitialized();
    const { verification_request }: GetVerificationRequestResponse =
      await this._signingClient!.queryContractSmart(
        this.claimNameContractAddress,
        {
          get_verification_request: {
            request_id: requestId,
          },
        }
      );

    if (!verification_request) {
      throw new Error("Verification request not found");
    }

    return {
      tweetId: verification_request.tweet_id,
      requesterHandle: verification_request.twitter_handle,
      requesterAddress: verification_request.owner_address,
    };
  }

  async verifyRequest(requestId: number, approved: boolean) {
    this.checkInitialized();
    const response = await this._signingClient!.execute(
      this.osmosisAddress!,
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
