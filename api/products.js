export const config = {
  runtime: 'edge',
};

import { kv } from '@vercel/kv';

export default async function handler(request) {
  try {
    if (request.method === 'GET') {
      const products = (await kv.get('products')) || [];
      return new Response(JSON.stringify(products), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST') {
      const body = await request.json();
      const { nombre, proveedor, url } = body;

      if (!nombre || !proveedor || !url) {
        return new Response(
          JSON.stringify({ error: 'Datos incompletos' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const products = (await kv.get('products')) || [];

      const nuevo = {
        id: Date.now(),
        nombre,
        proveedor,
        url,
      };

      products.push(nuevo);
      await kv.set('products', products);

      return new Response(JSON.stringify(nuevo), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Error en servidor', detalle: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
``
