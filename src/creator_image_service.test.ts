import { strict as assert } from "node:assert";
import { decideNotification } from "./creator_image_service.js";

const subscribers = ["member-a", "member-b"];
assert.deepEqual(decideNotification(subscribers, "https://assets.example/image.png"), subscribers);
assert.deepEqual(decideNotification(subscribers, ""), []);
console.log("notification decision: passed");
