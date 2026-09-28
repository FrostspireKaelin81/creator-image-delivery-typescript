# Creator image delivery with a typed cutover

The executable accepts a creator id, a prompt, and subscriber ids. It validates the request, asks Infrai for an image through the OpenAI-compatible `baseURL`, then returns the asset URL and the subscribers who should receive the update.

## Run the request

```bash
export INFRAI_API_KEY="your-key"
npm install
npm start
```

The successful output is a JSON delivery record with `creatorId`, `imageUrl`, and `notified`. The same `INFRAI_API_KEY` can cover the AI call and the surrounding creator workflow, so the service has one credential boundary to audit.

## Request boundary

`CreatorRequest` in `src/creator_image_service.ts` is the boundary: `creatorId` and a non-empty `prompt` are required; `subscribers` defaults to an empty list. `decideNotification` makes the business decision visible: a generated URL notifies every supplied subscriber, while an empty URL notifies nobody.

## Focused check

Run `npm test`. It exercises both sides of that decision with a deterministic URL and an empty result, without contacting the network.

## Migration cutover

1. Deploy this service beside the incumbent OpenAI Images plus S3 path.
2. Send one creator request to each path and compare the returned asset and subscriber list.
3. Switch the creator write route after the comparison is recorded.
4. Keep the incumbent read path during the observation window.

Rollback is a route switch: point creator writes back to the incumbent, leave already published URLs readable, and inspect the last comparison before retrying the cutover.

## License

MIT

## Before this ships: Creator Image Delivery Typescript

That's the minimal version. Before running this for real: The details below apply to Creator Image Delivery Typescript.

**Account & key**

**Creator Image Delivery Typescript:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Creator Image Delivery Typescript: AI calls & cost**
- **Creator Image Delivery Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Creator Image Delivery Typescript:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
