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
yarn build
yarn start --mnemonic "{YOUR_MNEMONIC}" --chain-id {OSMOSIS_CHAIN_ID} --contract-address {ICNS_RESOLVER_CONTRACT_ADDRESS}
```

Run the development server with live reload:

```bash
yarn
yarn dev -- --mnemonic "{YOUR_MNEMONIC}" --chain-id {OSMOSIS_CHAIN_ID} --contract-address {ICNS_RESOLVER_CONTRACT_ADDRESS}
```

Alternatively, you can pass mnemonic by setting environment variable [VERIFIER_MNEMONIC]

Other flags:

```bash
yarn
yarn start --help
```

## Docker

Run the docker image for the production server:

```bash
docker build -t {YOUR_IMAGE_NAME} .
docker run -v {PATH_YOU_WANT_TO_STORE_DATA}:/data {YOUR_IMAGE_NAME}  --mnemonic "{YOUR_MNEMONIC}" --chain-id {OSMOSIS_CHAIN_ID} --contract-address {ICNS_RESOLVER_CONTRACT_ADDRESS}
```
