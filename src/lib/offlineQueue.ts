"use client";

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "updatetech-pos-offline";
const STORE_NAME = "pending-sales";

type QueuedSale = {
  id: string; // id local temporaire
  gate: string;
  endpoint: string; // ex. "/api/pos/sale"
  payload: Record<string, unknown>;
  queuedAt: string;
};

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

export async function queueOfflineSale(gate: string, endpoint: string, payload: Record<string, unknown>) {
  const db = await getDb();
  const entry: QueuedSale = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    gate,
    endpoint,
    payload,
    queuedAt: new Date().toISOString(),
  };
  await db.put(STORE_NAME, entry);
  return entry.id;
}

export async function getQueuedSales(): Promise<QueuedSale[]> {
  const db = await getDb();
  return db.getAll(STORE_NAME);
}

export async function removeQueuedSale(id: string) {
  const db = await getDb();
  await db.delete(STORE_NAME, id);
}

/** Rejoue toutes les ventes en attente. Appelée automatiquement au retour
 * de connexion, et peut aussi être déclenchée manuellement. Retourne le
 * nombre de ventes synchronisées avec succès. */
export async function syncQueuedSales(): Promise<number> {
  const queued = await getQueuedSales();
  let synced = 0;

  for (const sale of queued) {
    try {
      const res = await fetch(sale.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sale.payload),
      });
      if (res.ok) {
        await removeQueuedSale(sale.id);
        synced += 1;
      }
      // Si le serveur répond mais refuse (ex. stock insuffisant depuis),
      // on laisse l'entrée en file pour une revue manuelle plutôt que de
      // la perdre silencieusement.
    } catch {
      // Toujours hors-ligne ou requête réseau échouée : on s'arrête ici,
      // on retentera au prochain événement "online".
      break;
    }
  }

  return synced;
}
