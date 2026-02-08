"use client";

import { useState, useEffect, useCallback } from "react";
import { request, connect, isConnected } from "@stacks/connect";
import { contractAddress, contractName, networkKind } from "@/config";
import { fetchTowerState, type TowerState } from "@/lib/contract";
import styles from "./Tower.module.css";

function shortAddress(addr: string) {
  if (!addr) return "—";
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 5)}…${addr.slice(-4)}`;
}

function TowerViz({ height }: { height: number }) {
  const maxBlocks = 40;
  const shown = Math.min(height, maxBlocks);
  const hidden = Math.max(height - maxBlocks, 0);

  return (
    <div className={styles.towerWrap} aria-label="Tower visualization">
      <div className={styles.towerLabel}>Height: {height}</div>

      <div className={styles.tower}>
  {shown === 0 ? (
    <div className={styles.emptyTower}>
      No blocks yet. Be the first to stack.
    </div>
  ) : (
    Array.from({ length: shown }).map((_, i) => (
      <div key={i} className={styles.block} />
    ))
  )}
</div>

      {hidden > 0 && (
        <div className={styles.more}>+{hidden} more blocks</div>
      )}
    </div>
  );
}

export function Tower() {
  const [state, setState] = useState<TowerState | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stackStatus, setStackStatus] = useState<string | null>(null);
  const [stacking, setStacking] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchTowerState();
      setState(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tower");
      setState(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setConnected(isConnected());
  }, []);

  async function handleConnect() {
    try {
      await connect();
      setConnected(true);
      setStackStatus(null);
    } catch (e) {
      setStackStatus(e instanceof Error ? e.message : "Connect failed");
    }
  }

  async function handleStack() {
    const oldHeight = Number(state?.height ?? "0");

    if (!connected) {
      setStackStatus("Connect your wallet first");
      return;
    }
    setStacking(true);
    setStackStatus("Preparing…");
    try {
      const response = await request("stx_callContract", {
        contract: `${contractAddress}.${contractName}`,
        functionName: "stack",
        functionArgs: [],
        network: networkKind,
      });

      const txid = (response as { txid?: string })?.txid;

      if (txid) {
        setStackStatus(`Broadcasted: ${txid.slice(0, 10)}…`);
        setStackStatus("Broadcasted. Waiting for confirmation…");

const updated = await waitForHeightIncrease(oldHeight);

if (updated) {
  setState(updated);
  setStackStatus("Confirmed! Tower updated.");
} else {
  setStackStatus("Broadcasted. Still confirming… try Refresh.");
}

      } else {
        setStackStatus("Broadcast succeeded");
        await load();
      }
    } catch (e) {
      setStackStatus(e instanceof Error ? e.message : "Stack failed");
    } finally {
      setStacking(false);
    }
  }
  async function waitForHeightIncrease(oldHeight: number, timeoutMs = 60000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    await new Promise((r) => setTimeout(r, 4000));

    const data = await fetchTowerState();
    const newHeight = Number(data.height || "0");

    if (newHeight > oldHeight) return data;
  }

  return null;
}


  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <p className={styles.loading}>Loading tower…</p>
        </div>
      </div>
    );
  }

  const heightNum = Number(state?.height ?? "0") || 0;

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.sideTower} ${styles.sideTowerLeft}`}>
  {Array.from({ length: 18 }).map((_, i) => (
    <div
      key={i}
      className={styles.sideBlock}
      style={{ width: `${70 + (i % 6) * 5}%`, margin: "0 auto" }}
    />
  ))}
</div>

<div className={`${styles.sideTower} ${styles.sideTowerRight}`}>
  {Array.from({ length: 22 }).map((_, i) => (
    <div
      key={i}
      className={styles.sideBlock}
      style={{ width: `${60 + (i % 7) * 6}%`, margin: "0 auto" }}
    />
  ))}
</div>

      <div className={styles.card}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.title}>Stacks Tower</h1>
            <p className={styles.motto}>Stack by stack.</p>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <section className={styles.section} aria-label="Tower visualization">
          <h2 className={styles.sectionTitle}>Tower</h2>
          <TowerViz height={heightNum} />
        </section>

        {state && (
          <section className={styles.section} aria-label="Tower state">
            <h2 className={styles.sectionTitle}>Tower state</h2>
            <dl className={styles.dl}>
              <div>
                <dt>Height</dt>
                <dd>{state.height}</dd>
              </div>
              <div>
                <dt>Last stacker</dt>
                <dd>{state.lastStacker ? shortAddress(state.lastStacker) : "—"}</dd>
              </div>
            </dl>
          </section>
        )}

        <section className={styles.section}>
          <div className={styles.buttonRow}>
            {!connected ? (
              <button
                type="button"
                className={styles.button}
                onClick={handleConnect}
              >
                Connect Hiro wallet
              </button>
            ) : (
              <button
                type="button"
                className={styles.button}
                onClick={handleStack}
                disabled={stacking}
              >
                {stacking ? "Stacking…" : "Stack +1"}
              </button>
            )}

            <button
              type="button"
              className={`${styles.button} ${styles.secondaryButton}`}
              onClick={load}
            >
              Refresh
            </button>
          </div>
        </section>

        {stackStatus && (
          <p className={styles.status} role="status">
            {stackStatus}
          </p>
        )}
      </div>
    </div>
  );
}
