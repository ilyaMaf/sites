import { TYPES, price, rub, clampArea } from "./price.js";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- Hero: wipe the dirty frame off the clean one ----------
const hero = document.querySelector("[data-hero]");
const dirt = hero.querySelector("canvas");
const ctx = dirt.getContext("2d");
const brush = hero.querySelector(".hero__brush");
const meter = hero.querySelector("[data-meter]");
// Low-res copy of the wipe mask: cheap to read back for the "how clean is it" check.
const mask = document.createElement("canvas");
const mctx = mask.getContext("2d", { willReadFrequently: true });
const img = new Image();
const GOAL = 0.6;
let w = 0, h = 0, dpr = 1, r = 60, last = null, cleaned = false, started = false, queued = false;

function clean() {
  if (cleaned) return;
  cleaned = true;
  meter.textContent = "100";
  hero.classList.remove("is-hovering");
  hero.classList.add("is-clean");
}

const copy = (c) => {
  const k = document.createElement("canvas");
  k.width = c.width; k.height = c.height;
  k.getContext("2d").drawImage(c, 0, 0);
  return k;
};

function cover(cw, ch) { // object-fit: cover, same crop as the <img> underneath
  const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
  const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
  return [(cw - dw) / 2, (ch - dh) / 2, dw, dh];
}

function fit() {
  const b = hero.getBoundingClientRect();
  if (cleaned || (b.width === w && b.height === h)) return;
  const keep = w ? [copy(dirt), copy(mask)] : null;
  w = b.width; h = b.height;
  dpr = Math.min(devicePixelRatio || 1, 2);
  r = Math.max(44, Math.min(90, Math.min(w, h) * 0.1)); // finger-sized on phones
  hero.style.setProperty("--r", `${r}px`);
  dirt.width = Math.round(w * dpr); dirt.height = Math.round(h * dpr);
  ctx.drawImage(img, ...cover(dirt.width, dirt.height));
  mask.width = 96; mask.height = Math.max(1, Math.round((96 * h) / w));
  mctx.fillStyle = "#000";
  mctx.fillRect(0, 0, mask.width, mask.height);
  // ponytail: on resize the old wipe is stretched onto the new size, close enough for a rotate.
  if (keep) for (const [c, k] of [[ctx, keep[0]], [mctx, keep[1]]]) {
    c.globalCompositeOperation = "destination-in";
    c.drawImage(k, 0, 0, c.canvas.width, c.canvas.height);
    c.globalCompositeOperation = "source-over";
  }
}

function dab(c, x, y, rad) { // soft round brush
  const g = c.createRadialGradient(x, y, 0, x, y, rad);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.5, "rgba(0,0,0,.85)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g;
  c.beginPath();
  c.arc(x, y, rad, 0, Math.PI * 2);
  c.fill();
}

function wipe(x, y) {
  if (cleaned || !w) return;
  const from = last ?? { x, y };
  const steps = Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / (r * 0.25)));
  const ms = mask.width / w;
  ctx.globalCompositeOperation = mctx.globalCompositeOperation = "destination-out";
  for (let i = 1; i <= steps; i++) {
    const px = from.x + ((x - from.x) * i) / steps, py = from.y + ((y - from.y) * i) / steps;
    dab(ctx, px * dpr, py * dpr, r * dpr);
    dab(mctx, px * ms, py * ms, r * ms);
  }
  ctx.globalCompositeOperation = mctx.globalCompositeOperation = "source-over";
  last = { x, y };
  if (!started) { started = true; hero.classList.add("is-scrubbing"); }
  if (!queued) { queued = true; setTimeout(measure, 120); }
}

function measure() {
  queued = false;
  const d = mctx.getImageData(0, 0, mask.width, mask.height).data;
  let clear = 0;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 128) clear++;
  const share = clear / (d.length / 4);
  meter.textContent = Math.min(99, Math.round((share / GOAL) * 100));
  if (share >= GOAL) clean();
}

dirt.addEventListener("pointerdown", (e) => {
  const b = dirt.getBoundingClientRect();
  last = null;
  wipe(e.clientX - b.left, e.clientY - b.top);
});
dirt.addEventListener("pointermove", (e) => {
  const b = dirt.getBoundingClientRect();
  const mouse = e.pointerType === "mouse";
  if (mouse) {
    brush.style.transform = `translate(${e.clientX - b.left}px, ${e.clientY - b.top}px)`;
    hero.classList.add("is-hovering");
  }
  // Mouse wipes on hover, finger and pen only while pressed.
  if (!mouse && !e.buttons) return;
  for (const p of e.getCoalescedEvents?.() ?? [e]) wipe(p.clientX - b.left, p.clientY - b.top);
});
for (const t of ["pointerup", "pointercancel"]) dirt.addEventListener(t, () => (last = null));
dirt.addEventListener("pointerleave", () => { last = null; hero.classList.remove("is-hovering"); });
hero.querySelector("[data-skip]").addEventListener("click", clean);

img.onload = () => { fit(); new ResizeObserver(fit).observe(hero); };
img.onerror = clean; // no dirt to wipe, just show the clean hero
img.src = dirt.dataset.dirt;

// ---------- Nav turns solid once the hero is scrolled away ----------
const nav = document.querySelector("[data-nav]");
new IntersectionObserver(([e]) => nav.classList.toggle("is-solid", !e.isIntersecting), {
  rootMargin: "-68px 0px 0px 0px",
}).observe(hero);

// ---------- Scroll reveal ----------
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}, { rootMargin: "0px 0px -8% 0px" });
for (const el of document.querySelectorAll(".reveal")) {
  const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.setProperty("--i", sibs.indexOf(el) % 5);
  io.observe(el);
}

// ---------- Calculator ----------
const calc = document.querySelector("[data-calc]");
const totalEl = document.querySelector("[data-total]");
const summaryEl = document.querySelector("[data-summary]");
const f = calc.elements;
let shown = 0, frame = 0, current = { total: 0, text: "" };

function show(to) {
  cancelAnimationFrame(frame);
  if (reduceMotion || !shown) { shown = to; totalEl.textContent = rub(to); return; }
  const from = shown, t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 450);
    shown = Math.round(from + (to - from) * (1 - (1 - k) ** 3));
    totalEl.textContent = rub(Math.round(shown / 10) * 10);
    if (k < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
}

function update(e) {
  if (e?.target === f.areaRange) f.area.value = f.areaRange.value;
  if (e?.target === f.area && f.area.value !== "") f.areaRange.value = clampArea(f.area.value);
  const extras = [...calc.querySelectorAll("[name=extra]:checked")].map((i) => i.value);
  const total = price(f.type.value, f.area.value, extras);
  let text = `${TYPES[f.type.value].name}, ${clampArea(f.area.value)} м²`;
  if (extras.length) text += ` + ${extras.length} доп.`;
  summaryEl.textContent = text;
  current = { total, text };
  show(total);
}
calc.addEventListener("input", update);
f.area.addEventListener("change", () => { f.area.value = clampArea(f.area.value); update(); });
calc.addEventListener("submit", (e) => e.preventDefault());
update();

const picked = document.querySelector("[data-picked]");
document.querySelector("[data-to-order]").addEventListener("click", () => {
  picked.textContent = `${current.text}: примерно ${rub(current.total)}`;
  picked.hidden = false;
});

// ---------- Before / after ----------
const ba = document.querySelector("[data-ba]");
const baRange = ba.querySelector("input");
let dragging = false;
const setPos = (v) => {
  v = Math.max(0, Math.min(100, v));
  ba.style.setProperty("--pos", `${v}%`);
  baRange.value = v;
};
const fromEvent = (e) => {
  const b = ba.getBoundingClientRect();
  setPos(((e.clientX - b.left) / b.width) * 100);
};
baRange.addEventListener("input", () => setPos(+baRange.value));
ba.addEventListener("pointerdown", (e) => {
  dragging = true;
  ba.setPointerCapture(e.pointerId);
  if (e.pointerType === "mouse") fromEvent(e); // a tap on a phone should not jump, a drag should
});
ba.addEventListener("pointermove", (e) => dragging && fromEvent(e));
for (const t of ["pointerup", "pointercancel"]) ba.addEventListener(t, () => (dragging = false));

// ---------- Order form (demo: nothing is sent) ----------
const order = document.querySelector("[data-order]");
const done = document.querySelector("[data-done]");
order.elements.date.min = new Date().toLocaleDateString("sv"); // YYYY-MM-DD, local
order.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!order.checkValidity()) {
    order.classList.add("tried");
    order.querySelector(":invalid").focus();
    return;
  }
  order.hidden = true;
  done.hidden = false;
  done.focus();
});
