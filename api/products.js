import { kv } from "@vercel/kv";

const KEY = "products";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const products = (await kv.get(KEY)) || [];
    return res.status(200).json(products);
  }

  if (req.method === "POST") {
    const { nombre, proveedor, url } = req.body;

    if (!nombre || !proveedor || !url) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const products = (await kv.get(KEY)) || [];
    products.push({ nombre, proveedor, url });
    await kv.set(KEY, products);

    return res.status(200).json({ ok: true });
  }

  return res.status(405).end("Method not allowed");
}
