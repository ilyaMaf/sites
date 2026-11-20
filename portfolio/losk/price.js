// Calculator pricing. Rates and minimums match the "от" prices in the services block.
export const TYPES = {
  regular:    { name: "Поддерживающая", rate: 85,  min: 3200 },
  deep:       { name: "Генеральная",    rate: 170, min: 6900 },
  renovation: { name: "После ремонта",  rate: 240, min: 9800 },
};
export const EXTRAS = { windows: 1600, sofa: 2400, fridge: 900 };

export const clampArea = (a) => Math.min(300, Math.max(15, Math.round(Number(a) || 0)));

export function price(type, area, extras = []) {
  const t = TYPES[type] ?? TYPES.regular;
  const base = Math.max(t.min, clampArea(area) * t.rate);
  const add = extras.reduce((s, e) => s + (EXTRAS[e] ?? 0), 0);
  return Math.round((base + add) / 10) * 10;
}

export const rub = (n) => n.toLocaleString("ru-RU").replace(/ | /g, " ") + " ₽";
