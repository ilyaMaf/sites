// Options and pricing for the configurator. Prices are "от": base modules, standard depth, no appliances.
// Each shape knows how many metres of worktop and how many fronts it has, so materials scale with the kitchen.
export const SHAPES = {
  straight: { name: "Прямая",     kitchen: "Прямая кухня",     note: "3 м",          base: 189000, worktop: 3.0, fronts: 16 },
  corner:   { name: "Угловая",    kitchen: "Угловая кухня",    note: "3 + 2 м",      base: 259000, worktop: 5.0, fronts: 24 },
  island:   { name: "С островом", kitchen: "Кухня с островом", note: "3 м + остров", base: 349000, worktop: 5.1, fronts: 22 },
};

// k: multiplier on the cabinet price (finish of the fronts).
export const FRONTS = {
  white: { name: "Белый мат",       hex: "#ecebe6", k: 1 },
  sage:  { name: "Шалфей",          hex: "#97a28c", k: 1.08 },
  clay:  { name: "Глина",           hex: "#c39c80", k: 1.08 },
  ink:   { name: "Индиго", hex: "#2f3b4f", k: 1.1 },
  black: { name: "Графит",          hex: "#38393a", k: 1.1 },
  oak:   { name: "Шпон дуба",       hex: "#b4895e", k: 1.32 },
};

// perM: rubles per metre of worktop.
export const TOPS = {
  quartz: { name: "Белый кварц",  hex: "#eceae5", perM: 16000 },
  stone:  { name: "Тёмный камень", hex: "#2c2c2d", perM: 19000 },
  oak:    { name: "Массив дуба",  hex: "#b98b5d", perM: 9500 },
  cement: { name: "Микроцемент",  hex: "#a7a39c", perM: 12000 },
};

// each: rubles per front.
export const HANDLES = {
  profile: { name: "Без ручек", each: 1300 },
  brass:   { name: "Латунные скобы", each: 1100 },
  knob:    { name: "Чёрные кнобы", each: 450 },
};

export const DEFAULT = { shape: "corner", front: "sage", top: "quartz", handle: "brass" };

export function price({ shape, front, top, handle }) {
  const s = SHAPES[shape], f = FRONTS[front], t = TOPS[top], h = HANDLES[handle];
  if (!s || !f || !t || !h) throw new Error(`unknown option ${JSON.stringify({ shape, front, top, handle })}`);
  return Math.round((s.base * f.k + s.worktop * t.perM + s.fronts * h.each) / 1000) * 1000;
}

export const rub = (n) => n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
