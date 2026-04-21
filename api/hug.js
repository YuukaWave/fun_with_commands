import { Redis } from "@upstash/redis";
import { allowedStreamers } from "../lib/config.js";

console.log(process.env.UPSTASH_REDIS_REST_URL);

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  let { user, target, streamer } = req.query;

  streamer = streamer || "default";

  // whitelist check
  if (!allowedStreamers.includes(streamer)) {
    return res.send("Invalid streamer.");
  }

  const globalKey = "hug:global:total";
  const streamerKey = `hug:${streamer}:total`;
  const userKey = `hug:${streamer}:${user}`;

  // SECRET MODE (global stats)
  if (target && target.includes("WhatIsLove")) {
    const global = (await redis.get(globalKey)) || 0;
    return res.send(
      `🎶 Baby don't hurt me... 🎶 Singing There were ${global} hugs given across all realms!`
    );
  }

  // no target
  if (!target || target.trim() === "") {
    return res.send(
      `${user} tries to hug but it seems too complicated... MikuHuh`
    );
  }

  const cleanTarget = target.replace("@", "").trim();

  // self stats mode
if (
  cleanTarget.toLowerCase() === "me" ||
  cleanTarget.toLowerCase() === user.toLowerCase()
) {
  const count = (await redis.get(userKey)) || 0;
  return res.send(
    `${user} hugged others ${count} times on this stream.`
  );
}

  // update stats
  const global = await redis.incr(globalKey);
  const streamerTotal = await redis.incr(streamerKey);
  await redis.incr(userKey);

  return res.send(
    `${user} hugs ${cleanTarget}! There were ${streamerTotal} hugs on ${streamer} stream.`
  );
}
