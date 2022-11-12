import { Secp256k1HdWallet } from "@cosmjs/amino";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import assert from "assert";

export async function setupClient() {
  const rpcEndpoint = process.env.OSMOSIS_RPC_ENDPOINT;
  const mnemonic = process.env.OSMOSIS_WALLET_MNEMONIC;

  assert(!!rpcEndpoint, "Must provide OSMOSIS_RPC_ENDPOINT.");
  assert(!!mnemonic, "Must provide OSMOSIS_WALLET_MNEMONIC.");

  const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic);
  const [osmosisAddress] = await wallet.getAccounts();

  const cosmwasmClient = await SigningCosmWasmClient.connectWithSigner(
    rpcEndpoint,
    wallet
  );
  return { cosmwasmClient, osmosisAddress };
}
