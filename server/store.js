// Order storage: a JSON file, held in memory and rewritten on every change.
// Enough for one restaurant's traffic; swap these three functions for a real database later.
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = process.env.ORDERS_FILE || join(dirname(fileURLToPath(import.meta.url)), 'data', 'orders.json');

let orders = {};
try { orders = JSON.parse(await readFile(FILE, 'utf8')); } catch { /* first run */ }

// Writes go one after another, through a temp file, so a crash never leaves half a file
let queue = Promise.resolve();
function persist() {
  const json = JSON.stringify(orders, null, 1);
  queue = queue.then(async () => {
    await mkdir(dirname(FILE), { recursive: true });
    await writeFile(`${FILE}.tmp`, json);
    await rename(`${FILE}.tmp`, FILE);
  });
  return queue;
}

export const get = (id) => orders[id] ?? null;

export async function create(order) {
  orders[order.id] = order;
  await persist();
  return order;
}

export async function update(id, patch) {
  if (!orders[id]) return null;
  orders[id] = { ...orders[id], ...patch };
  await persist();
  return orders[id];
}
