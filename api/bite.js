export default function handler(req, res) {
  let { user, target } = req.query;

  // brak targetu lub tylko spacje
  if (!target || target.trim() === "") {
    return res.send(`${user} tries to bite but misses.`);
  }

  // usuń @ i ewentualne spacje
  target = target.replace("@", "").trim();

  // jeśli po czyszczeniu nadal puste → brak targetu
  if (!target) {
    return res.send(`${user} tries to bite but misses.`);
  }

  if (user.toLowerCase() === target.toLowerCase()) {
    return res.send(`${user} bites themselves in confusion!`);
  }

  const success = [
    `${user} bites ${target}!`,
    `${user} chomps ${target}!`,
    `${user} CRITS ${target}! That's gonna leave a mark... marinTehe `
  ];

  const fail = [
    `${user} gets bitten by ${target} instead!`,
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
