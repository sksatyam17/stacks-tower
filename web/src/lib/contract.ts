import {
  fetchCallReadOnlyFunction,
  cvToValue,
  type ClarityValue,
} from "@stacks/transactions";

import { getNetwork, contractAddress, contractName } from "@/config";

const DUMMY_SENDER = "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR";

export type TowerState = {
  height: string;
  lastStacker: string | null;
};

function parseOkValue(cv: ClarityValue): unknown {
  const json = cvToValue(cv) as { type: string; value?: unknown };
  if (json.type === "response" && json.value) {
    const v = json.value as { type: string; value?: unknown };
    if (v.type === "ok" && v.value !== undefined) return v.value;
  }
  return null;
}

function parseUint(cv: ClarityValue): string | null {
  const inner = parseOkValue(cv);
  if (
    inner &&
    typeof inner === "object" &&
    "type" in inner &&
    (inner as { type: string }).type === "uint"
  ) {
    const obj = inner as { value?: string | number };
    return String(obj.value ?? "0");
  }
  return null;
}

function parseOptionalPrincipal(cv: ClarityValue): string | null {
  const inner = parseOkValue(cv);
  if (!inner || typeof inner !== "object") return null;

  const obj = inner as { type: string; value?: any };

  // optional principal
  if (obj.type === "optional") {
    if (!obj.value) return null;

    const val = obj.value as { type: string; value?: any };
    if (val.type === "principal" && val.value?.address)
      return String(val.value.address);

    return null;
  }

  // direct principal
  if (obj.type === "principal" && obj.value?.address) {
    return String(obj.value.address);
  }

  return null;
}

export async function fetchTowerState(): Promise<TowerState> {
  try {
    const network = "mainnet" as const;

    const heightCv = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-height",
      functionArgs: [],
      senderAddress: contractAddress,
    });

    const lastStackerCv = await fetchCallReadOnlyFunction({
      network,
      contractAddress,
      contractName,
      functionName: "get-last-stacker",
      functionArgs: [],
      senderAddress: contractAddress,
    });

    const heightVal = cvToValue(heightCv) as any;
    const lastStackerVal = cvToValue(lastStackerCv) as any;

    const height = String(heightVal?.value ?? "0");

    let lastStacker: string | null = null;

    // Handle optional principal in different shapes
    if (typeof lastStackerVal === "string") {
      lastStacker = lastStackerVal;
    } else if (lastStackerVal?.type === "some") {
      lastStacker = String(lastStackerVal.value);
    } else if (lastStackerVal?.value?.type === "some") {
      lastStacker = String(lastStackerVal.value.value);
    } else if (typeof lastStackerVal?.value === "string") {
      lastStacker = String(lastStackerVal.value);
    } else if (typeof lastStackerVal?.value?.value === "string") {
      lastStacker = String(lastStackerVal.value.value);
    }

    return {
      height,
      lastStacker,
    };
  } catch (e) {
    console.error("fetchTowerState failed:", e);
    return {
      height: "0",
      lastStacker: null,
    };
  }
}

