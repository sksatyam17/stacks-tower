import { StacksMainnet, StacksTestnet } from "@stacks/network";
import fetch from "cross-fetch";


export type NetworkKind = "mainnet" | "testnet";

export const networkKind: NetworkKind = "mainnet";

export const contractAddress: string = "SP2HV0WHZAQS2S3FRNMP0GP2R28T8AB64N8PQANM8";
export const contractName: string = "stacks-tower";

export function getNetwork() {
  const net =
    networkKind === "mainnet" ? new StacksMainnet() : new StacksTestnet();

  // patch fetch for stacks transactions read-only calls
  (net as any).fetch = fetch;


  return net;
}
