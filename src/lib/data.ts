/*
 * Data access for this app. Every table lives in Prompify's database and is reached through the
 * data proxy, configured at runtime by /env-config.js (window.__PROMPIFY_CONFIG).
 *
 * Use `useTable('table_name')` in a page to load rows and create, update or delete them.
 * Each row has an `id`, `created_at` and `updated_at` managed by the database.
 *
 * Outside Prompify (no config) it falls back to an in-memory copy of src/lib/demo-data.ts so the
 * template can be previewed locally.
 */
import { useCallback, useEffect, useState } from 'react';
import { DEMO_ROWS } from './demo-data';

export type Row = {
  id: string;
  created_at?: string;
  updated_at?: string;
  [column: string]: unknown;
};

type PrompifyConfig = { apiUrl?: string; chatId?: string; token?: string };

declare global {
  interface Window {
    __PROMPIFY_CONFIG?: PrompifyConfig;
  }
}

function config(): PrompifyConfig {
  return window.__PROMPIFY_CONFIG || {};
}

const isConnected = () => Boolean(config().apiUrl && config().chatId);

async function request<T>(table: string, init: RequestInit = {}, query = ''): Promise<T> {
  const cfg = config();

  const res = await fetch(`${cfg.apiUrl}/${cfg.chatId}/${table}${query}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.token ?? ''}`,
      ...(init.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body?.error || `Request failed (HTTP ${res.status})`);
  }

  return body.data as T;
}

/** Lists and objects are stored in jsonb columns and must be sent as JSON text. */
const toBody = (values: Record<string, unknown>) =>
  JSON.stringify(
    Object.fromEntries(
      Object.entries(values)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, v !== null && typeof v === 'object' ? JSON.stringify(v) : v]),
    ),
  );

/* In-memory store used only for local previews. */
const demo: Record<string, Row[]> = {};
const demoTable = (table: string) =>
  (demo[table] ??= ((DEMO_ROWS[table] ?? []) as Row[]).map((r) => ({ ...r })));

const demoDb = {
  list: (table: string) => demoTable(table).map((r) => ({ ...r })),
  create: (table: string, values: Partial<Row>) => {
    const now = new Date().toISOString();
    const row = { ...values, id: crypto.randomUUID(), created_at: now, updated_at: now } as Row;
    demoTable(table).unshift(row);
    return { ...row };
  },
  update: (table: string, id: string, values: Partial<Row>) => {
    const rows = demoTable(table);
    const i = rows.findIndex((r) => r.id === id);
    if (i < 0) throw new Error('Row not found');
    rows[i] = { ...rows[i]!, ...values, updated_at: new Date().toISOString() };
    return { ...rows[i]! };
  },
  remove: (table: string, id: string) => {
    demo[table] = demoTable(table).filter((r) => r.id !== id);
    return { deleted: true };
  },
};

export const db = {
  list: async <T extends Row = Row>(table: string) =>
    isConnected() ? request<T[]>(table, {}, '?limit=1000') : (demoDb.list(table) as T[]),
  create: async <T extends Row = Row>(table: string, values: Partial<T>) =>
    isConnected()
      ? request<T>(table, { method: 'POST', body: toBody(values) })
      : (demoDb.create(table, values) as T),
  update: async <T extends Row = Row>(table: string, id: string, values: Partial<T>) =>
    isConnected()
      ? request<T>(table, { method: 'PATCH', body: toBody(values) }, `?id=${encodeURIComponent(id)}`)
      : (demoDb.update(table, id, values) as T),
  remove: async (table: string, id: string) =>
    isConnected()
      ? request<{ deleted: boolean }>(table, { method: 'DELETE' }, `?id=${encodeURIComponent(id)}`)
      : demoDb.remove(table, id),
};

/**
 * Load a table and keep it in sync with create/update/remove.
 * `error` is set when the data store cannot be reached; the page should still render
 * (with an empty list) and show <DataNotice error={error} />.
 */
export function useTable<T extends Row = Row>(table: string) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setRows((await db.list<T>(table)) ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = async (values: Partial<T>) => {
    const row = await db.create<T>(table, values);
    setRows((prev) => [row, ...prev]);
    return row;
  };

  const update = async (id: string, values: Partial<T>) => {
    const row = await db.update<T>(table, id, values);
    setRows((prev) => prev.map((r) => (r.id === id ? row : r)));
    return row;
  };

  const remove = async (id: string) => {
    await db.remove(table, id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return { rows, loading, error, reload, create, update, remove };
}
