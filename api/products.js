const KV_URL = process.env.KV_REDIS_URL || process.env.REDIS_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || "";
const KEY = "products";

async function kvGet(key) {
  const res = await fetch(`${KV_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

async function kvSet(key, value) {
  await fetch(`${KV_URL}/set/${key}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([JSON.stringify(value)]),
  });
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const products = (await kvGet(KEY)) || [];
    return res.status(200).json(products);
  }

  if (req.method === "POST") {
    const { nombre, proveedor, url } = req.body;
    if (!nombre || !proveedor || !url) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    const products = (await kvGet(KEY)) || [];
    products.push({ nombre, proveedor, url });
    await kvSet(KEY, products);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end("Method not allowed");
}
