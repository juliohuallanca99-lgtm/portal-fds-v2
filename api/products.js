import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    // LISTAR productos
    if (req.method === 'GET') {
      const products = await kv.get('products') || [];
      return res.status(200).json(products);
    }

    // GUARDAR producto
    if (req.method === 'POST') {
      const { nombre, proveedor, url } = req.body;

      if (!nombre || !proveedor || !url) {
        return res.status(400).json({ error: 'Datos incompletos' });
      }

      const products = await kv.get('products') || [];

      const nuevo = {
        id: Date.now(),
        nombre,
        proveedor,
        url
      };

      products.push(nuevo);
      await kv.set('products', products);

      return res.status(201).json(nuevo);
    }

    return res.status(405).json({ error: 'Método no permitido' });

  } catch (error) {
    return res.status(500).json({ error: 'Error en servidor' });
  }
}
