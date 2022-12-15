# icns-twitter-verifier

## Testing

```bash
yarn
yarn test
```

## CLI

Run the production server:
```bash
yarn
yarn start --mnemonic "{YOUR_MNEMONIC}" --chain-id {CHAIN_ID} --contract-address {CONTRACT_ADDRESS}
```

Run the development server with live reload:
```bash
yarn
yarn dev -- --mnemonic "{YOUR_MNEMONIC}" --chain-id {CHAIN_ID} --contract-address {CONTRACT_ADDRESS}
```
  
Alternatively, you can pass mnemonic by setting environment variable [VERIFIER_MNEMONIC]  
  
Other flags:
```bash
yarn
yarn start --help
```
