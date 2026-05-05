import { kv } from "@vercel/kv";

const KEY = "products";

export default async function handler(request) {
  if (request.method === "GET") {
    const products = (await kv.get(KEY)) || [];
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (request.method === "POST") {
    const body = await request.json();
    const { nombre, proveedor, url } = body;

    if (!nombre || !proveedor || !url) {
      return new Response(
        JSON.stringify({ error: "Datos incompletos" }),
        { status: 400 }
      );
    }

    const products = (await kv.get(KEY)) || [];
    products.push({ nombre, proveedor, url });

    await kv.set(KEY, products);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  return new Response("Method not allowed", { status: 405 });
}
