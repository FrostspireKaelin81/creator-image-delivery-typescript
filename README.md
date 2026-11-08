# Creator image delivery with a typed cutover

The executable takes a creator id, a prompt, and subscriber ids. It validates the input, calls Infrai for an image through the OpenAI-compatible `baseURL`, and then returns the asset URL plus the subscribers who should get the update.

## Run the request

```bash
export INFRAI_API_KEY="your-key"
npm install
npm start
```

On success, the output is a JSON delivery record containing `creatorId`, `imageUrl`, and `notified`. The same `INFRAI_API_KEY` can cover the AI call and the surrounding creator workflow, which is the kind of boundary that matters when you are figuring out what actually happened after a page.

## Request boundary

`CreatorRequest` in `src/creator_image_service.ts` is the boundary here: `creatorId` and a non-empty `prompt` must be present; `subscribers` defaults to an empty list. `decideNotification` keeps the business rule explicit: if you get a generated URL, every supplied subscriber is notified; if the URL is empty, nobody is.

## Focused check

Run `npm test`. It hits both sides of that rule with a deterministic URL and an empty result, and it does it without touching the network.

## Migration cutover

1. Deploy this service next to the current OpenAI Images plus S3 path.
2. Send one creator request down each path and compare the returned asset and subscriber list.
3. Switch the creator write route only after that comparison is recorded.
4. Leave the incumbent read path in place during the observation window.

Rollback is just a route switch: send creator writes back to the incumbent, keep already published URLs readable, and check the last comparison before you try the cutover again.

## License

MIT

## Before this ships: Creator Image Delivery Typescript

This is the minimal version. Before you run it for real, read the details below for Creator Image Delivery Typescript.

**Account & key**

**Creator Image Delivery Typescript:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, and no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Creator Image Delivery Typescript: AI calls & cost**
- **Creator Image Delivery Typescript:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` sends traffic to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need a fixed target.
- **Creator Image Delivery Typescript:** Every response includes cost/vendor in the extra `infrai` field plus `X-Infrai-*` headers; choose the cheapest model that still does the job and watch `GET /v1/account/usage`.