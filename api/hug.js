import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  let { user, target, streamer } = req.query;

  if (!streamer) streamer = "default";

  const globalKey = "hug:global:total";
  const streamerTotalKey = `hug:${streamer}:total`;
  const userKey = `hug:${streamer}:${user}`;

  // SECRET MODE
  if (target && target.includes("WhatIsLove")) {
    const global = (await redis.get(globalKey)) || 0;
    return res.send(
      `🎶 Baby don't hurt me! Don't hurt me! No more... 🎶 Singing There were ${global} hugs given across all realms!`
    );
  }

  // no target
  if (!target || target.trim() === "") {
    return res.send(
      `${user} tries to hug but it seems too complicated... MikuHuh`
    );
  }

  const cleanTarget = target.replace("@", "").trim();

  // self stats
  if (cleanTarget.toLowerCase() === "me") {
    const count = (await redis.get(userKey)) || 0;
    return res.send(
      `${user} hugged others ${count} times on this stream.`
    );
  }

  // update stats
  const global = await redis.incr(globalKey);
  const streamerTotal = await redis.incr(streamerTotalKey);
  await redis.incr(userKey);

  return res.send(
    `${user} hugs ${cleanTarget}! There were ${streamerTotal} hugs on this stream.`
  );
}
