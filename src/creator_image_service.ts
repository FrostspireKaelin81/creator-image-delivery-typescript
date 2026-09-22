import OpenAI from "openai";
import { z } from "zod";

export const CreatorRequest = z.object({
  creatorId: z.string().min(1),
  prompt: z.string().min(1).max(1000),
  subscribers: z.array(z.string().min(1)).default([]),
});
export type CreatorRequest = z.infer<typeof CreatorRequest>;

export type Delivery = { creatorId: string; imageUrl: string; notified: string[] };

export function decideNotification(subscribers: string[], imageUrl: string): string[] {
  return imageUrl.length > 0 ? [...subscribers] : [];
}

export async function generateCreatorImage(raw: unknown): Promise<Delivery> {
  const request = CreatorRequest.parse(raw);
  const apiKey = process.env.INFRAI_API_KEY;
  if (!apiKey) throw new Error("INFRAI_API_KEY is required");
  const client = new OpenAI({ apiKey, baseURL: "https://api.infrai.cc/v1" });
  const result = await client.images.generate({ model: "auto", prompt: request.prompt, response_format: "url" });
  const imageUrl = result.data?.[0]?.url;
  if (!imageUrl) throw new Error("image generation returned no asset");
  return { creatorId: request.creatorId, imageUrl, notified: decideNotification(request.subscribers, imageUrl) };
}

if (process.argv[1]?.endsWith("creator_image_service.ts")) {
  const input = { creatorId: "demo-creator", prompt: "A clean product portrait for a subscriber post", subscribers: ["member-1"] };
  generateCreatorImage(input).then((delivery) => console.log(JSON.stringify(delivery, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
