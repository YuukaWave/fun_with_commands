import { Redis } from "@upstash/redis";
import { allowedStreamers } from "../lib/config.js";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  let { user = "unknown", target = "", streamer = "default" } = req.query;

  // whitelist
  if (!allowedStreamers.includes(streamer)) {
    return res.send("Invalid streamer.");
  }

  const globalKey = "hug:global:total";
  const streamerKey = `hug:${streamer}:total`;
  const userKey = `hug:${streamer}:${user}`;
  const globalUserKey = `hug:global:user:${user}`;

  // SECRET MODE
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
  const normalizedTarget = cleanTarget.toLowerCase();
  const normalizedUser = user.toLowerCase();

  // SELF / STATS MODE (me or own nick)
  if (
    normalizedTarget === "me" ||
    normalizedTarget === normalizedUser
  ) {
    const local = (await redis.get(userKey)) || 0;
    const globalUser = (await redis.get(globalUserKey)) || 0;

    let percent = 0;
    if (globalUser > 0) {
      percent = Math.round((local / globalUser) * 100);
    }

    return res.send(
      `${user} hugged others ${local} times here. Which is ${percent}% of their ${globalUser} hugs across the realms!`
    );
  }

  // NORMAL HUG → update stats
  await redis.incr(globalKey);
  const streamerTotal = await redis.incr(streamerKey);
  await redis.incr(userKey);
  await redis.incr(globalUserKey);

  return res.send(
    `${user} hugs ${cleanTarget}! There were ${streamerTotal} hugs on ${streamer} stream.`
  );
}
