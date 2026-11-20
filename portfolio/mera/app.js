import { SHAPES, FRONTS, TOPS, HANDLES, DEFAULT, price, rub } from "./price.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const GROUPS = { shape: SHAPES, front: FRONTS, top: TOPS, handle: HANDLES };
const LABEL = { shape: "Форма", front: "Фасады", top: "Столешница", handle: "Ручки" };

// ---------- option chips (built from price.js so names, swatches and prices never drift apart) ----------
const ICONS = {
  straight: '<path d="M4 8h24"/>',
  corner: '<path d="M6 26V8h22"/>',
  island: '<path d="M4 7h24M10 20h12v5H10z"/>',
  profile: '<path d="M5 12h22" stroke-width="3"/><path d="M5 17h22" opacity=".35"/>',
  brass: '<path d="M8 16h16" stroke-width="3"/><path d="M10 16v-3M22 16v-3"/>',
  knob: '<circle cx="16" cy="16" r="4" fill="currentColor"/>',
};
for (const [group, opts] of Object.entries(GROUPS)) {
  $(`[data-group=${group}]`).innerHTML = Object.entries(opts).map(([id, o]) => {
    const sw = ICONS[id] && (group === "shape" || group === "handle")
      ? `<svg viewBox="0 0 32 32" aria-hidden="true">${ICONS[id]}</svg>`
      : "";
    return `<label class="chip chip--${group}"><input type="radio" name="${group}" value="${id}">
      <span class="chip__sw sw-${group}-${id}" style="--c:${o.hex ?? "transparent"}">${sw}</span>
      <span class="chip__t">${o.name}${o.note ? `<small>${o.note}</small>` : ""}</span></label>`;
  }).join("");
}

const form = $("[data-config]");
const stage = $("[data-stage]");
const thumb = $("[data-thumb]");
let state = { ...DEFAULT };

const layers = (c) => ["base", `front-${c.front}`, `top-${c.top}`, `handle-${c.handle}`, "over"].map((n) => `img/${c.shape}/${n}.webp`);
function frame(c) {
  const f = document.createElement("div");
  f.className = "frame";
  for (const src of layers(c)) f.append(Object.assign(new Image(1600, 1000), { src, alt: "", decoding: "async" }));
  return f;
}
const describe = (c) => `${SHAPES[c.shape].kitchen}: фасады ${FRONTS[c.front].name.toLowerCase()}, столешница ${TOPS[c.top].name.toLowerCase()}, ручки ${HANDLES[c.handle].name.toLowerCase()}`;

// Crossfade: the new layer stack decodes off-screen, then fades in over the old one; fast clicking only shows the last pick.
let seq = 0;
async function show(c) {
  const id = ++seq, f = frame(c);
  await Promise.all([...f.children].map((i) => i.decode().catch(() => {})));
  if (id !== seq) return;
  stage.append(f);
  stage.setAttribute("aria-label", describe(c));
  const drop = () => { while (stage.firstChild && stage.firstChild !== f) stage.firstChild.remove(); };
  if (reduce.matches || stage.children.length === 1) { f.classList.add("in"); drop(); return; }
  void f.offsetWidth;
  f.classList.add("in");
  f.addEventListener("transitionend", drop, { once: true });
}

// Warm the cache with every variant of a shape, so the next pick fades instantly.
const warmed = new Set();
function warm(shape) {
  if (warmed.has(shape)) return;
  warmed.add(shape);
  const go = () => {
    for (const g of ["front", "top", "handle"]) for (const id in GROUPS[g]) new Image().src = `img/${shape}/${g}-${id}.webp`;
    new Image().src = `img/${shape}/base.webp`; new Image().src = `img/${shape}/over.webp`;
  };
  "requestIdleCallback" in window ? requestIdleCallback(go) : setTimeout(go, 600);
}

// Price counter: eases from the shown value to the new one.
const priceEl = $("[data-price]");
let shown = 0, raf = 0;
function count(to) {
  const from = shown, t0 = performance.now(), dur = reduce.matches || !from ? 0 : 700;
  cancelAnimationFrame(raf);
  priceEl.dataset.dir = to > from ? "up" : "down";
  const tick = (t) => {
    const k = dur ? Math.min(1, (t - t0) / dur) : 1;
    shown = Math.round(from + (to - from) * (1 - (1 - k) ** 3));
    priceEl.textContent = rub(shown);
    if (k < 1) raf = requestAnimationFrame(tick);
    else delete priceEl.dataset.dir;
  };
  raf = requestAnimationFrame(tick);
}

function render() {
  const sum = price(state);
  for (const g in GROUPS) {
    form.elements[g].value = state[g];
    $(`[data-picked=${g}]`).textContent = GROUPS[g][state[g]].name;
  }
  show(state);
  warm(state.shape);
  count(sum);
  $("[data-price-sr]").textContent = `Цена от ${rub(sum)}`;
  $("[data-price-copy]").textContent = rub(sum);
  $("[data-summary]").innerHTML = Object.keys(GROUPS).map((g) => `<div><dt>${LABEL[g]}</dt><dd>${GROUPS[g][state[g]].name}</dd></div>`).join("");
  thumb.replaceChildren(frame(state));
  thumb.firstChild.classList.add("in");
  for (const el of $$("[data-dim]")) {
    const on = el.dataset.dim === state.shape;
    el.hidden = !on;
    $("input", el).disabled = !on;
  }
}

form.addEventListener("change", (e) => {
  state = { ...state, [e.target.name]: e.target.value };
  render();
});
form.addEventListener("submit", (e) => e.preventDefault());

// ---------- "save the estimate" form ----------
const order = $("[data-order]");
const sent = $("[data-sent]");
const okContact = (v) => {
  v = v.trim();
  const digits = v.replace(/\D/g, "").length;
  return (/^\+?[\d\s()-]+$/.test(v) && digits >= 10 && digits <= 12) || /^@?[a-zA-Z][\w]{4,31}$/.test(v);
};
function message(el) {
  const v = el.validity;
  if (v.valueMissing) return "Заполните поле";
  if (v.badInput) return "Введите число";
  if (v.rangeUnderflow) return `Не меньше ${el.min} см`;
  if (v.rangeOverflow) return `Не больше ${el.max} см`;
  if (v.stepMismatch) return "Целое число сантиметров";
  return el.validationMessage;
}
const errEl = (el) => $(`#${el.id}-err`);
function check(el) {
  if (el.name === "contact") el.setCustomValidity(!el.value.trim() || okContact(el.value) ? "" : "Телефон из 10–11 цифр или ник в Telegram, например @mera_kitchen");
  const bad = !el.checkValidity();
  el.setAttribute("aria-invalid", bad);
  el.setAttribute("aria-describedby", `${el.id}-err`);
  errEl(el).textContent = bad ? message(el) : "";
  return !bad;
}
order.addEventListener("input", (e) => { if (e.target.getAttribute("aria-invalid") === "true") check(e.target); });
order.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fields = $$("input", order).filter((el) => el.willValidate);
  const bad = fields.filter((el) => !check(el));
  if (bad.length) return bad[0].focus();
  const btn = $("button[type=submit]", order);
  btn.disabled = true;
  btn.textContent = "Отправляем…";
  await new Promise((r) => setTimeout(r, 900)); // demo: pretend the request went out
  const d = Object.fromEntries(new FormData(order));
  const sizes = [["стена", d.len], ["вторая стена", d.len2], ["остров", d.island], ["потолок", d.height]].filter(([, v]) => v).map(([k, v]) => `${k} ${v}`).join(", ");
  const tg = !/^\+?[\d\s()-]+$/.test(d.contact.trim());
  $("[data-sent-text]").textContent = `Заявка М-${String(Date.now()).slice(-4)}. ${d.name.trim()}, дизайнер напишет вам ${tg ? "в Telegram" : "по телефону"} ${d.contact.trim()} в течение часа и пришлёт расчёт. ${describe(state)}. Размеры, см: ${sizes}. Цена от ${rub(price(state))}.`;
  order.hidden = true;
  sent.hidden = false;
  sent.focus();
});
$("[data-again]").addEventListener("click", () => {
  sent.hidden = true;
  order.hidden = false;
  const btn = $("button[type=submit]", order);
  btn.disabled = false;
  btn.textContent = "Отправить расчёт";
  $("#config").scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth" });
});

// ---------- portfolio ribbon ----------
const ribbon = $("[data-ribbon]");
const arrows = $$("[data-scroll]");
const step = () => ribbon.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(ribbon).columnGap || 0);
arrows.forEach((b) => b.addEventListener("click", () => ribbon.scrollBy({ left: step() * b.dataset.scroll, behavior: reduce.matches ? "auto" : "smooth" })));
const ends = () => {
  arrows[0].disabled = ribbon.scrollLeft < 4;
  arrows[1].disabled = ribbon.scrollLeft + ribbon.clientWidth > ribbon.scrollWidth - 4;
};
ribbon.addEventListener("scroll", ends, { passive: true });
addEventListener("resize", ends);
ends();

// "Собрать такую же": load that kitchen into the configurator.
ribbon.addEventListener("click", (e) => {
  const b = e.target.closest("[data-copy]");
  if (!b) return;
  const [shape, front, top, handle] = b.dataset.copy.split(" ");
  state = { shape, front, top, handle };
  render();
  // On phones each group is a sideways row: centre the picked chip without moving the page.
  for (const g in GROUPS) {
    const chip = $(`input[name=${g}]:checked`).closest(".chip"), row = chip.parentElement;
    row.scrollLeft = chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2;
  }
  $("#config").scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth" });
});

// ---------- reveals ----------
$$("main h2, .steps li, .ribbon, .reviews figure, .warranty__grid > *").forEach((el) => el.classList.add("rv"));
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$(".rv").forEach((el) => io.observe(el));
} else $$(".rv").forEach((el) => el.classList.add("in"));

render();
