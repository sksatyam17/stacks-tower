/**
 * Stacks Tower dApp config.
 * Set contractAddress after deploying the contract.
 */

import { StacksMainnet, StacksTestnet } from "@stacks/network";

export type NetworkKind = "mainnet" | "testnet";

export const networkKind: NetworkKind = "testnet";

export const contractAddress: string = "SP...PLACEHOLDER";
export const contractName: string = "stacks-tower";

export function getNetwork() {
  return networkKind === "mainnet" ? new StacksMainnet() : new StacksTestnet();
}
