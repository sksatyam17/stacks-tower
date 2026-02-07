"use client";

import { useState, useEffect, useCallback } from "react";
import { request, connect, isConnected } from "@stacks/connect";
import { contractAddress, contractName, networkKind } from "@/config";
import { fetchTowerState, type TowerState } from "@/lib/contract";
import styles from "./Tower.module.css";

export function Tower() {
  const [state, setState] = useState<TowerState | null>(null);
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

  async function handleConnect() {
    try {
      await connect();
      setStackStatus(null);
    } catch (e) {
      setStackStatus(e instanceof Error ? e.message : "Connect failed");
    }
  }

  async function handleStack() {
    if (!isConnected()) {
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
        await load();
        setStackStatus("Broadcasted. Confirming…");
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

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.loading}>Loading tower…</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Stacks Tower</h1>
      <p className={styles.motto}>Stack by stack.</p>

      {error && <p className={styles.error}>{error}</p>}

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
              <dd>{state.lastStacker ?? "—"}</dd>
            </div>
            <div>
              <dt>Last stacked at (block)</dt>
              <dd>{state.lastStackedAt ?? "—"}</dd>
            </div>
          </dl>
        </section>
      )}

      <section className={styles.section}>
        {!isConnected() ? (
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
      </section>

      {stackStatus && (
        <p className={styles.status} role="status">
          {stackStatus}
        </p>
      )}
    </div>
  );
}
