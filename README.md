# icns-twitter-verifier

## Testing

```
yarn
yarn test
```

## Development

Add an `.env` file and fill the following variables or manually add them in your terminal.

```
VERIFIER_PRIVATE_KEY=...
```

Run the development server:

```bash
yarn
yarn dev
```

And you can query `POST http://localhost:8080/api/verify_twitter` to verify the given request.

e.g.:

```bash
curl -X POST http://localhost:8080/api/verify_twitter \
   -H 'Content-Type: application/json' \
   -d '{"authToken":"<Twitter-OAuth2-token>","msg":"{\"name\":\"elonmusk\",\"claimer\":\"<Osmosis-address>\"}"}'
```

## Production

coming soon!
