import type { Slide } from "../types/blocks";

const DB_NAME = "techpack-editor-db";
const DB_VERSION = 1;
const STORE_NAME = "snapshots";

export type EditorSnapshot = {
  slides: Slide[];
  activeSlideId: string;
};

export type SnapshotRecord = {
  id: string;
  name: string;
  createdAt: number;
  data: EditorSnapshot;
};

export type SnapshotMeta = Pick<SnapshotRecord, "id" | "name" | "createdAt">;

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });

const withStore = async <T>(mode: IDBTransactionMode, runner: (store: IDBObjectStore) => Promise<T>) => {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, mode);
  const store = tx.objectStore(STORE_NAME);

  try {
    const result = await runner(store);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
    });
    return result;
  } finally {
    db.close();
  }
};

export const saveSnapshot = async (data: EditorSnapshot, name?: string) => {
  const createdAt = Date.now();
  const record: SnapshotRecord = {
    id: `snapshot-${createdAt}`,
    name: name?.trim() || `Snapshot ${new Date(createdAt).toLocaleString()}`,
    createdAt,
    data,
  };

  await withStore("readwrite", (store) =>
    new Promise<void>((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("Failed to save snapshot"));
    })
  );

  return record;
};

export const listSnapshots = async () => {
  const records = await withStore("readonly", (store) =>
    new Promise<SnapshotRecord[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve((request.result as SnapshotRecord[]) ?? []);
      request.onerror = () => reject(request.error ?? new Error("Failed to list snapshots"));
    })
  );

  return records
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((record) => ({ id: record.id, name: record.name, createdAt: record.createdAt }));
};

export const loadSnapshot = async (id: string) => {
  return withStore("readonly", (store) =>
    new Promise<SnapshotRecord | null>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve((request.result as SnapshotRecord | undefined) ?? null);
      request.onerror = () => reject(request.error ?? new Error("Failed to load snapshot"));
    })
  );
};

export const deleteSnapshot = async (id: string) => {
  await withStore("readwrite", (store) =>
    new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("Failed to delete snapshot"));
    })
  );
};
