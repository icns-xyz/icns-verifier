# icns-twitter-verifier

## Development

Add an `.env` file and fill the following variables or manually add them in your terminal.
```
TWITTER_BEARER_TOKEN=...
OSMOSIS_RPC_ENDPOINT=...
OSMOSIS_WALLET_MNEMONIC=...
CLAIM_NAME_CONTRACT_ADDRESS=...
```

Run the development server:

```bash
yarn
yarn dev
```

And you can query `http://localhost:8080/verify/<request-id>` to verify the given request, if it exists in the [claimname](https://github.com/osmosis-labs/icns/blob/main/contracts/claimname) contract storage.

## Production
coming soon!
