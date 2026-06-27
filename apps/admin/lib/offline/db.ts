'use client';

/**
 * Offline IndexedDB storage for POS operations.
 * Stores cached inventory, pending sales, and sync metadata
 * so staff can continue selling even when the network is down.
 */

const DB_NAME = 'dream-gadgets-offline';
const DB_VERSION = 1;

// ── Schema ──

export interface CachedInventoryItem {
  id: string;
  imei: string;
  brandName: string;
  modelName: string;
  condition: string;
  sellingPrice: number;
  totalCost: number;
  storage?: string;
  colour?: string;
  ram?: string;
  status: string;
  branchId?: string;
  cachedAt: number;
}

export interface PendingSale {
  id?: number;
  createdAt: number;
  payload: string; // JSON string of sale payload
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string;
  syncedAt?: number;
  invoiceNumber?: string;
}

export interface CachedEntry {
  key: string;
  data: unknown;
  cachedAt: number;
}

export interface SyncLogEntry {
  id?: number;
  operation: string;
  status: 'started' | 'completed' | 'failed';
  details: string;
  timestamp: number;
}

// ── Database ──

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Inventory items cache
      if (!db.objectStoreNames.contains('inventory_items')) {
        const store = db.createObjectStore('inventory_items', { keyPath: 'id' });
        store.createIndex('imei', 'imei', { unique: true });
        store.createIndex('brandName', 'brandName', { unique: false });
        store.createIndex('modelName', 'modelName', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      // Pending sales (offline-queued)
      if (!db.objectStoreNames.contains('pending_sales')) {
        const store = db.createObjectStore('pending_sales', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // General-purpose cache (brands, models, settings, etc.)
      if (!db.objectStoreNames.contains('cached_data')) {
        db.createObjectStore('cached_data', { keyPath: 'key' });
      }

      // Sync audit log
      if (!db.objectStoreNames.contains('sync_log')) {
        const store = db.createObjectStore('sync_log', {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    req.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    req.onerror = (event) => reject((event.target as IDBRequest).error);
  });
}

// ── Generic helpers ──

function getAll<T>(storeName: string, indexName?: string, value?: IDBValidKey): Promise<T[]> {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = indexName && value !== undefined
        ? store.index(indexName).getAll(value)
        : store.getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    }).catch(reject);
  });
}

function getOne<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    }).catch(reject);
  });
}

function putRecord(storeName: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(value);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    }).catch(reject);
  });
}

function deleteRecord(storeName: string, key: IDBValidKey): Promise<void> {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.delete(key);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    }).catch(reject);
  });
}

function clearStore(storeName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    }).catch(reject);
  });
}

function countStore(storeName: string, indexName?: string, value?: IDBValidKey): Promise<number> {
  return new Promise((resolve, reject) => {
    openDB().then((db) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = indexName && value !== undefined
        ? store.index(indexName).count(value)
        : store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    }).catch(reject);
  });
}

// ── Public API ──

export const offlineDB = {
  // ── Inventory cache ──
  async cacheInventoryItems(items: CachedInventoryItem[]) {
    if (items.length === 0) return;
    const db = await openDB();
    const tx = db.transaction('inventory_items', 'readwrite');
    const store = tx.objectStore('inventory_items');
    for (const item of items) {
      store.put({ ...item, cachedAt: Date.now() });
    }
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    });
  },

  async getCachedInventory(): Promise<CachedInventoryItem[]> {
    return getAll<CachedInventoryItem>('inventory_items');
  },

  async searchCachedInventory(query: string): Promise<CachedInventoryItem[]> {
    const all = await this.getCachedInventory();
    const q = query.toLowerCase();
    return all.filter(
      (item) =>
        item.imei.toLowerCase().includes(q) ||
        item.brandName.toLowerCase().includes(q) ||
        item.modelName.toLowerCase().includes(q) ||
        `${item.brandName} ${item.modelName}`.toLowerCase().includes(q),
    );
  },

  async getCachedItemByIMEI(imei: string): Promise<CachedInventoryItem | undefined> {
    const all = await this.getCachedInventory();
    return all.find((i) => i.imei === imei);
  },

  async getCachedItemById(id: string): Promise<CachedInventoryItem | undefined> {
    return getOne<CachedInventoryItem>('inventory_items', id);
  },

  async removeCachedItem(id: string) {
    await deleteRecord('inventory_items', id);
  },

  async clearInventoryCache() {
    await clearStore('inventory_items');
  },

  async getInventoryCount(): Promise<number> {
    return countStore('inventory_items');
  },

  // ── Pending sales queue ──
  async queueSale(payload: object): Promise<number> {
    const entry: PendingSale = {
      createdAt: Date.now(),
      payload: JSON.stringify(payload),
      status: 'pending',
      retryCount: 0,
    };
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('pending_sales', 'readwrite');
      const store = tx.objectStore('pending_sales');
      const req = store.add(entry);
      req.onsuccess = () => resolve(req.result as number);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
  },

  async getPendingSales(): Promise<PendingSale[]> {
    return getAll<PendingSale>('pending_sales', 'status', 'pending');
  },

  async getAllPendingSales(): Promise<PendingSale[]> {
    return getAll<PendingSale>('pending_sales');
  },

  async updateSaleStatus(id: number, status: PendingSale['status'], error?: string, invoiceNumber?: string) {
    const existing = await getOne<PendingSale>('pending_sales', id);
    if (!existing) return;
    existing.status = status;
    existing.retryCount += 1;
    existing.lastError = error;
    if (status === 'synced') {
      existing.syncedAt = Date.now();
      existing.invoiceNumber = invoiceNumber;
    }
    await putRecord('pending_sales', existing);
  },

  async removeSale(id: number) {
    await deleteRecord('pending_sales', id);
  },

  async clearSyncedSales() {
    const all = await getAll<PendingSale>('pending_sales');
    const synced = all.filter((s) => s.status === 'synced');
    for (const s of synced) {
      if (s.id !== undefined) await deleteRecord('pending_sales', s.id);
    }
  },

  async getPendingSalesCount(): Promise<number> {
    return countStore('pending_sales', 'status', 'pending');
  },

  // ── General cache ──
  async setCache(key: string, data: unknown) {
    await putRecord('cached_data', { key, data, cachedAt: Date.now() });
  },

  async getCache<T>(key: string): Promise<T | undefined> {
    const entry = await getOne<CachedEntry>('cached_data', key);
    return entry?.data as T | undefined;
  },

  async removeCache(key: string) {
    await deleteRecord('cached_data', key);
  },

  async clearCache() {
    await clearStore('cached_data');
  },

  // ── Sync log ──
  async logSync(operation: string, status: SyncLogEntry['status'], details: string) {
    const entry: SyncLogEntry = {
      operation,
      status,
      details,
      timestamp: Date.now(),
    };
    const db = await openDB();
    const tx = db.transaction('sync_log', 'readwrite');
    tx.objectStore('sync_log').add(entry);
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => reject(tx.error);
    });
  },

  async getSyncLogs(limit = 50): Promise<SyncLogEntry[]> {
    const all = await getAll<SyncLogEntry>('sync_log');
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  },

  async clearSyncLogs() {
    await clearStore('sync_log');
  },

  // ── Database info ──
  async getDatabaseInfo() {
    const db = await openDB();
    const info = {
      name: db.name,
      version: db.version,
      stores: Array.from(db.objectStoreNames),
    };
    db.close();
    return info;
  },
};
