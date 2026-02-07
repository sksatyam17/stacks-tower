# Stacks Tower

A simple Stacks dApp: connect your Hiro wallet and press a button to add +1 to a public onchain tower.

## Run the web app

1. Install dependencies:
   ```bash
   cd web
   npm install
   ```
2. Set the contract address and network in config (see below).
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000).

## Deploy the contract (high level)

Deploy the Clarity contract in `contracts/stacks-tower.clar` to the Stacks network before using the web app with a real contract.

- **Clarinet**: use `clarinet deploy` for testnet (configure in Clarinet.toml and run from the project root).
- **Hiro**: use the [Hiro Platform](https://platform.hiro.so/) or CLI to deploy the contract.
- **Explorer**: paste the contract into the [Stacks Explorer](https://explorer.hiro.so/) contract deploy UI for the target network.

Do not run deploy automatically from this repo; deploy manually when ready.

## Where to set contract address and name

Edit **`web/src/config.ts`**:

- **`contractAddress`** — Set to the deployed contract’s address (e.g. `SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR`) after deployment. Leave the placeholder until then.
- **`contractName`** — Contract name (default: `stacks-tower`). Must match the name used when deploying.
- **`networkKind`** — `"testnet"` or `"mainnet"` to match the network you deployed to.
