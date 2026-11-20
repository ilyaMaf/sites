// Услуги, пакеты и подсчёт расчёта. Цены «от»: седан среднего класса, без сложных повреждений.
// x/y — точка хотспота в процентах горизонтального кадра (box-*.webp), mx/my — вертикального (box-*-m.webp).
export const ZONES = [
  { id: "body", label: "Кузов", x: 29, y: 45, mx: 24, my: 49.5, title: "3 варианта защиты", services: [
    { id: "polish", name: "Полировка", text: "Восстановительная: убираем голограммы, паутинку и мелкие царапины.", time: "1–2 дня", price: 18000 },
    { id: "ceramic", name: "Керамика", text: "Два слоя кварцевого покрытия: глубокий блеск и защита до трёх лет.", time: "2 дня", price: 32000 },
    { id: "ppf", name: "Плёнка", text: "Полиуретан на ударную зону: капот, бампер, фары, зеркала. Сколы останутся на плёнке.", time: "2–3 дня", price: 45000 },
  ] },
  { id: "glass", label: "Стёкла", x: 46, y: 34, mx: 47, my: 43.5, title: "Стёкла", services: [
    { id: "antirain", name: "Антидождь", text: "Покрытие на все стёкла: капли скатываются уже на 60 км/ч. Держится до полугода.", time: "2 часа", price: 3500 },
    { id: "tint", name: "Тонировка", text: "Плёнка на заднюю полусферу или атермальная на лобовое — в рамках ГОСТ.", time: "1 день", price: 9000 },
  ] },
  { id: "interior", label: "Салон", x: 72, y: 36, mx: 80, my: 44.5, title: "Химчистка салона", services: [
    { id: "dryclean", name: "Химчистка салона", text: "Сиденья, потолок, ковры, пластик и багажник. В конце озонирование — без запахов.", time: "1 день", price: 12000 },
  ] },
  { id: "wheels", label: "Диски", x: 52.5, y: 63, mx: 55, my: 57.5, title: "Керамика дисков", services: [
    { id: "rims", name: "Керамика дисков", text: "Снимаем колёса, отмываем, покрываем керамикой. Тормозная пыль потом смывается обычной водой.", time: "1 день", price: 8000 },
  ] },
];

export const SERVICES = Object.fromEntries(ZONES.flatMap((z) => z.services.map((s) => [s.id, s])));

// Пакет дешевле суммы своих услуг; в расчёте он заменяет входящие в него отдельные услуги.
export const PACKAGES = [
  { id: "p-fresh", name: "Свежесть", lead: "Перед продажей или после зимы", includes: ["dryclean", "antirain", "rims"], time: "1–2 дня", price: 19900 },
  { id: "p-shine", name: "Блеск", lead: "Новый вид старой машине", includes: ["polish", "ceramic", "antirain"], time: "3 дня", price: 46900, hit: true },
  { id: "p-armor", name: "Броня", lead: "Для новой машины с салона", includes: ["ppf", "ceramic", "rims", "antirain"], time: "4 дня", price: 79900 },
];
const PACK = Object.fromEntries(PACKAGES.map((p) => [p.id, p]));

export const item = (id) => SERVICES[id] ?? PACK[id] ?? null;

// Добавление в расчёт: пакет вытесняет свои услуги, услуга, уже входящая в пакет, не дублируется.
export function add(cart, id) {
  if (!item(id)) throw new Error("unknown item " + id);
  const next = new Set(cart);
  if (PACK[id]) PACK[id].includes.forEach((s) => next.delete(s));
  else if ([...next].some((p) => PACK[p]?.includes.includes(id))) return next;
  next.add(id);
  return next;
}

export const covered = (cart, id) => cart.has(id) || [...cart].some((p) => PACK[p]?.includes.includes(id));
export const total = (cart) => [...cart].reduce((sum, id) => sum + item(id).price, 0);
export const listPrice = (pack) => pack.includes.reduce((sum, id) => sum + SERVICES[id].price, 0);
export const rub = (n) => n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₽";
