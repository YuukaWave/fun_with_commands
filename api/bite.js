export default function handler(req, res) {
  const { user, target } = req.query;

  if (!target) return res.send(`${user} tries to bite but misses.`);
  if (user.toLowerCase() === target.toLowerCase())
    return res.send(`${user} bites themselves in confusion!`);

  const success = [
    `${user} bites ${target}!`,
    `${user} chomps ${target}!`,
    `${user} CRITS ${target}!`
  ];

  const fail = [
    `${user} fails vs ${target}.`,
    `${user} misses ${target}.`,
    `${user} slips.`,
    `${user} gets dodged.`,
    `${user} bites air.`,
    `${user} hesitates.`,
    `${user} chickens out.`
  ];

  const roll = Math.random();
  const pool = roll < 0.3 ? success : fail;

  res.send(pool[Math.floor(Math.random() * pool.length)]);
}
