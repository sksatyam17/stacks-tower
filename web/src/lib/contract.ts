import {
  fetchCallReadOnlyFunction,
  cvToJSON,
  type ClarityValue,
} from "@stacks/transactions";
import { getNetwork, contractAddress, contractName } from "@/config";

const DUMMY_SENDER = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

export type TowerState = {
  height: string;
  lastStacker: string | null;
  lastStackedAt: string | null;
};

function parseOkValue(cv: ClarityValue): unknown {
  const json = cvToJSON(cv) as { type: string; value?: unknown };
  if (json.type === "response" && json.value) {
    const v = json.value as { type: string; value?: unknown };
    if (v.type === "ok" && v.value !== undefined) return v.value;
  }
  return null;
}

function parseUint(cv: ClarityValue): string | null {
  const inner = parseOkValue(cv);
  if (inner && typeof inner === "object" && "type" in inner && (inner as { type: string }).type === "uint") {
    return String((inner as { value: string }).value ?? "0");
  }
  return null;
}

function parseOptionalPrincipal(cv: ClarityValue): string | null {
  const inner = parseOkValue(cv);
  if (!inner || typeof inner !== "object") return null;
  const obj = inner as { type: string; value?: { type: string; address?: string } };
  if (obj.type === "optional" && obj.value) {
    if (obj.value.type === "principal" && obj.value.address)
      return obj.value.address;
    return null;
  }
  if (obj.type === "principal" && "address" in obj)
    return (obj as { address: string }).address;
  return null;
}

export async function fetchTowerState(): Promise<TowerState> {
  const network = getNetwork();

  const [heightCv, lastStackerCv, lastStackedAtCv] = await Promise.all([
    fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-height",
      functionArgs: [],
      senderAddress: DUMMY_SENDER,
    }),
    fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-last-stacker",
      functionArgs: [],
      senderAddress: DUMMY_SENDER,
    }),
    fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-last-stacked-at",
      functionArgs: [],
      senderAddress: DUMMY_SENDER,
    }),
  ]);

  return {
    height: parseUint(heightCv) ?? "0",
    lastStacker: parseOptionalPrincipal(lastStackerCv),
    lastStackedAt: parseUint(lastStackedAtCv),
  };
}
