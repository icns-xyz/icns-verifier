# icns-twitter-verifier

## Development

Add an `.env` file and fill the following variables or manually add them in your terminal.
```
TWITTER_BEARER_TOKEN=<your-key-here>
OSMOSIS_RPC_ENDPOINT=<rpc-endpoint>
OSMOSIS_WALLET_MNEMONIC=<your-seed-phrase>
CLAIM_NAME_CONTRACT_ADDRESS=<your-contract-address>
```

Run the development server:

```bash
yarn
yarn dev
```

And you can query `http://localhost:8080/verify/<request-id>` to verify the given request.

## Production
coming soon!
