import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_KV_REST_API_URL,
  token: process.env.UPSTASH_KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === "GET") {
    const history = (await redis.get("history")) || [];
    return res.status(200).json(history);
  }
  return res.status(405).end("Method not allowed");
}
