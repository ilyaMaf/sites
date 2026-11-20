// VOID: каталог для виртуального магазина. Цены, состав и остатки взяты из каталога сайта VOID (Collection 01 FORMWORK).
// Бренд вымышлен. Названия вещей и цветов оставлены латиницей по решению бренда.

export const COLOURS = {
  pitch: { name: "Pitch", swatch: "#141414" },
  ash: { name: "Ash", swatch: "#7a7a76" },
  chalk: { name: "Chalk", swatch: "#dddbd3" },
};

export const FREE_SHIPPING = 300;

// cm: длина вещи, по ней вещи на сцене масштабируются друг относительно друга; w: ширина вырезки при высоте 900
export const PRODUCTS = [
  {
    id: "cast-coat", name: "Cast Coat", price: 1190, cm: 118,
    fabric: "Шерсть с кашемиром, пальтовое сукно 640 г/м²",
    fit: "Широкий крой. Рост модели 187 см, размер M.",
    details: ["Спущенное плечо, скрытая застёжка", "Карманы в боковых швах", "Подкладка из купры"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colourways: [
      { colour: "pitch", w: 531, photos: ["V-09", "V-03", "V-08", "V-21"], stock: { XS: 3, S: 5, M: 0, L: 4, XL: 2 } },
      { colour: "ash", w: 536, photos: ["V-23", "V-08"], stock: { XS: 2, S: 4, M: 3, L: 0, XL: 1 } },
    ],
  },
  {
    id: "formwork-blazer", name: "Formwork Blazer", price: 740, cm: 74,
    fabric: "Шерстяной твил, 380 г/м²",
    fit: "Короткий прямой силуэт. Рост модели 178 см, размер S.",
    details: ["Плечо с жёсткой формой", "Застёжка на одну пуговицу", "Два прорезных кармана"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colourways: [{ colour: "pitch", w: 765, photos: ["V-10", "V-17", "V-04"], stock: { XS: 4, S: 3, M: 6, L: 2, XL: 3 } }],
  },
  {
    id: "hollow-knit", name: "Hollow Knit", price: 390, cm: 68,
    fabric: "Меринос, класс вязки 7",
    fit: "Широкий прямой крой. Рост модели 187 см, размер M.",
    details: ["Цельновязаный корпус без боковых швов", "Высокая горловина в рубчик", "Широкие манжеты"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colourways: [
      { colour: "pitch", w: 867, photos: ["V-11", "V-19", "V-03"], stock: { XS: 5, S: 6, M: 4, L: 5, XL: 0 } },
      { colour: "chalk", w: 728, photos: ["V-24", "V-06", "V-22"], stock: { XS: 2, S: 0, M: 3, L: 4, XL: 2 } },
    ],
  },
  {
    id: "panel-shirt", name: "Panel Shirt", price: 280, cm: 76,
    fabric: "Хлопковый поплин, 140 г/м²",
    fit: "Прямой свободный крой. Рост модели 178 см, размер S.",
    details: ["Скрытая планка", "Горизонтальный шов на груди", "Воротник-стойка"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colourways: [{ colour: "chalk", w: 818, photos: ["V-12", "V-18", "V-04"], stock: { XS: 3, S: 4, M: 4, L: 3, XL: 1 } }],
  },
  {
    id: "slab-tee", name: "Slab Tee", price: 120, cm: 70,
    fabric: "Хлопковый трикотаж, 300 г/м²",
    fit: "Широкий крой. Рост модели 178 см, размер M.",
    details: ["Плотный трикотаж", "Спущенное плечо", "Без принтов и нашивок"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colourways: [
      { colour: "pitch", w: 867, photos: ["V-13", "V-07"], stock: { XS: 8, S: 10, M: 12, L: 9, XL: 6 } },
      { colour: "chalk", w: 832, photos: ["V-25", "V-08"], stock: { XS: 4, S: 6, M: 7, L: 2, XL: 0 } },
    ],
  },
  {
    id: "pleat-trouser", name: "Pleat Trouser", price: 380, cm: 104,
    fabric: "Шерстяная фланель, 340 г/м²",
    fit: "Широкий крой, прямая посадка. Рост модели 187 см, размер M.",
    details: ["Два глубоких защипа", "Высокий пояс со скрытой застёжкой", "Карманы в боковых швах"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colourways: [
      { colour: "pitch", w: 383, photos: ["V-14", "V-03", "V-07"], stock: { XS: 3, S: 5, M: 5, L: 6, XL: 2 } },
      { colour: "ash", w: 475, photos: ["V-26", "V-06"], stock: { XS: 0, S: 3, M: 4, L: 3, XL: 1 } },
    ],
  },
  {
    id: "column-dress", name: "Column Dress", price: 420, cm: 138,
    fabric: "Вискозный трикотаж, 320 г/м²",
    fit: "Узкий прямой крой. Рост модели 178 см, размер S.",
    details: ["Длина в пол", "Разрезы по бокам", "Без швов спереди"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colourways: [{ colour: "pitch", w: 229, photos: ["V-15", "V-20", "V-05"], stock: { XS: 2, S: 3, M: 3, L: 2, XL: 0 } }],
  },
  {
    id: "grid-scarf", name: "Grid Scarf", price: 160, cm: 100,
    fabric: "Шерсть, фактурное клетчатое плетение",
    fit: "Один размер: 70 × 200 см.",
    details: ["Плетение с решёткой в тон", "Необработанные края", "Без бахромы"],
    sizes: ["OS"],
    colourways: [{ colour: "ash", w: 449, photos: ["V-16", "V-05"], stock: { OS: 12 } }],
  },
];

// Сцены. "plinths": бетонные постаменты, у каждого свой прожектор. "rail": лента вешалок под одним прожектором.
export const SCENES = [
  { id: "outerwear", name: "Верхняя одежда", short: "Верх", kind: "plinths",
    items: [["formwork-blazer", "pitch"], ["cast-coat", "pitch"], ["cast-coat", "ash"]] },
  { id: "knit", name: "Трикотаж и рубашки", short: "Трикотаж", kind: "rail",
    items: [["hollow-knit", "pitch"], ["panel-shirt", "chalk"], ["slab-tee", "pitch"], ["hollow-knit", "chalk"], ["slab-tee", "chalk"]] },
  { id: "trousers", name: "Брюки и платья", short: "Брюки", kind: "plinths",
    items: [["pleat-trouser", "pitch"], ["column-dress", "pitch"], ["pleat-trouser", "ash"]] },
  { id: "accessories", name: "Аксессуары", short: "Аксессуары", kind: "plinths",
    items: [["grid-scarf", "ash"]] },
];

export const PHOTO_ALT = {
  "V-03": "Образ 01 в бетонном зале", "V-04": "Образ 02 у бетонной стены", "V-05": "Образ 03 на пандусе",
  "V-06": "Образ 04 среди колонн", "V-07": "Образ 05 в проёме", "V-08": "Образ 06 в конце длинного зала",
  "V-17": "На модели", "V-18": "На модели", "V-19": "На модели", "V-20": "На модели",
  "V-21": "Сукно крупным планом", "V-22": "Мериносовый рубчик крупным планом",
};

const NBSP = " ";
export const price = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)}${NBSP}€`;
export const sizeLabel = (s) => (s === "OS" ? "Один размер" : s);
export const product = (id) => PRODUCTS.find((p) => p.id === id);
export const colourway = (p, colour) => p.colourways.find((w) => w.colour === colour) ?? p.colourways[0];
export const cutSrc = (id, colour) => `img/cut/${id}-${colour}.webp`;
export const photoSrc = (v) => `img/ph/${v}.webp`;
export function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  return m10 === 1 && m100 !== 11 ? one : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
}
