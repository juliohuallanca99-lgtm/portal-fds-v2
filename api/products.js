import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_KV_REST_API_URL,
  token: process.env.UPSTASH_KV_REST_API_TOKEN,
});

const KEY = "products";
const HISTORY_KEY = "history";

const USERS = {
  "admin1": "ANGELA-HUALLANCA",
  "admin2": "TSF3-SSOMA"
};

export default async function handler(req, res) {

  // GET — listar productos
  if (req.method === "GET") {
    const products = (await redis.get(KEY)) || [];
    return res.status(200).json(products);
  }

  // POST — agregar producto
  if (req.method === "POST") {
    const { nombre, proveedor, url, usuario } = req.body;
    if (!nombre || !proveedor || !url) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    const products = (await redis.get(KEY)) || [];
    const id = Date.now().toString();
    products.push({ id, nombre, proveedor, url });
    await redis.set(KEY, products);
    await agregarHistorial(redis, { accion: "CREÓ", producto: nombre, usuario: usuario || "Admin" });
    return res.status(200).json({ ok: true });
  }

  // PUT — editar producto
  if (req.method === "PUT") {
    const { id, nombre, proveedor, url, usuario } = req.body;
    if (!id || !nombre || !proveedor || !url) {
      return res.status(400).json({ error: "Datos incompletos" });
    }
    const products = (await redis.get(KEY)) || [];
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: "Producto no encontrado" });
    products[idx] = { id, nombre, proveedor, url };
    await redis.set(KEY, products);
    await agregarHistorial(redis, { accion: "EDITÓ", producto: nombre, usuario: usuario || "Admin" });
    return res.status(200).json({ ok: true });
  }

  // DELETE — eliminar producto
  if (req.method === "DELETE") {
    const { id, usuario, nombre } = req.body;
    if (!id) return res.status(400).json({ error: "ID requerido" });
    const products = (await redis.get(KEY)) || [];
    const filtered = products.filter(p => p.id !== id);
    await redis.set(KEY, filtered);
    await agregarHistorial(redis, { accion: "ELIMINÓ", producto: nombre || id, usuario: usuario || "Admin" });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end("Method not allowed");
}

async function agregarHistorial(redis, { accion, producto, usuario }) {
  const history = (await redis.get(HISTORY_KEY)) || [];
  history.unshift({
    accion,
    producto,
    usuario,
    fecha: new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })
  });
  if (history.length > 100) history.pop();
  await redis.set(HISTORY_KEY, history);
}
