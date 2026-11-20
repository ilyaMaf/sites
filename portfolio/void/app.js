import { COLOURS, FREE_SHIPPING, PRODUCTS, SCENES, PHOTO_ALT, price, sizeLabel, product, colourway, cutSrc, photoSrc, plural } from "./data.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));
const PLINTH = { // высота постамента: центральный выше, по краям ниже
  plinths: (i, n) => (n === 1 ? 96 : i === Math.floor(n / 2) ? 92 : 64),
};

/* ── сцены */
const hall = $(".hall"), pill = $(".pill");
for (const [n, s] of SCENES.entries()) {
  const sec = document.createElement("section");
  sec.className = `scene ${s.kind} is-off`; sec.id = s.id; sec.hidden = true;
  sec.setAttribute("aria-label", s.name);
  const count = s.items.length;
  sec.innerHTML = `
    <div class="s-head"><p class="s-num">0${n + 1} / 0${SCENES.length}</p><h1 class="s-title display">${s.name}</h1>
      <p class="s-count">${count} ${plural(count, "вещь", "вещи", "вещей")}</p></div>
    ${s.kind === "rail" ? `<div class="bar" aria-hidden="true"></div><span class="beam" aria-hidden="true"></span><span class="pool" aria-hidden="true"></span>` : ""}
    <div class="track"></div>
    ${s.kind === "rail" ? `<p class="caption" aria-live="polite"><b class="display"></b><span></span></p>
      <div class="rail-nav"><button type="button" class="prev" aria-label="Предыдущая вещь">←</button><button type="button" class="next" aria-label="Следующая вещь">→</button></div>` : ""}`;
  const track = $(".track", sec);
  s.items.forEach(([pid, colour], i) => {
    const p = product(pid), w = colourway(p, colour);
    const b = document.createElement("button");
    b.type = "button"; b.className = "item"; b.dataset.p = pid; b.dataset.c = colour;
    b.setAttribute("aria-label", `${p.name}, ${COLOURS[colour].name}, ${price(p.price)}`);
    const ph = PLINTH.plinths(i, count);
    b.style.cssText = `--cm:${p.cm};--ar:${w.w}/900;--d:${(0.25 + i * 0.22).toFixed(2)}s;--ph:${ph}px;--pw:calc(${p.cm} * var(--u) * ${(w.w / 900).toFixed(3)} + 56px)`;
    const img = `<img class="garment" src="${cutSrc(pid, colour)}" alt="" draggable="false" ${n ? 'loading="lazy"' : 'fetchpriority="high"'}>`;
    b.innerHTML = s.kind === "rail"
      ? `<span class="fig"><svg class="hanger" viewBox="0 0 120 46" aria-hidden="true"><path d="M60 22V12a6 6 0 1 1 6-6"/><path d="M60 22L8 44h104L60 22z"/></svg>${img}</span>`
      : `<span class="beam" aria-hidden="true"></span><span class="pool" aria-hidden="true"></span>
         <span class="fig">${img}<span class="plinth"><span class="plaque"><b>${p.name}</b>${price(p.price)}</span></span></span>`;
    track.append(b);
  });
  hall.append(sec);

  const btn = document.createElement("button");
  btn.type = "button"; btn.dataset.scene = s.id;
  btn.innerHTML = `<span class="long">${s.name}</span><span class="short">${s.short}</span>`;
  btn.addEventListener("click", () => go(s.id));
  pill.append(btn);
}
const info = document.createElement("button");
info.type = "button"; info.className = "i"; info.textContent = "i"; info.setAttribute("aria-label", "О бренде");
info.addEventListener("click", () => openDialog($(".about")));
pill.append(info);

/* ── переход: свет гаснет, загорается новая сцена */
let current = null, busy = false;
const hint = $(".hint");
async function go(id, first = false) {
  const next = document.getElementById(id);
  if (!next || next === current || busy) return;
  busy = true;
  $$(".pill [data-scene]").forEach((b) => b.setAttribute("aria-current", String(b.dataset.scene === id)));
  history.replaceState(null, "", `#${id}`);
  hint.classList.remove("show");
  if (current) {
    current.classList.remove("is-on"); current.classList.add("is-off");
    await wait(420);
    current.hidden = true;
  }
  next.hidden = false;
  next.classList.add("is-off"); next.classList.remove("is-on");
  if (next.classList.contains("rail")) { centre(next, railIndex.get(next) ?? 0, false); light(next); }
  await wait(first ? 350 : 160);
  next.offsetWidth;
  next.classList.remove("is-off"); next.classList.add("is-on");
  current = next;
  if (next.classList.contains("rail") || matchMedia("(max-width: 760px)").matches) setTimeout(() => current === next && hint.classList.add("show"), 1400);
  setTimeout(() => hint.classList.remove("show"), 5200);
  busy = false;
}

/* ── лента вешалок: колесо, перетаскивание, свайп, стрелки */
const railIndex = new Map();
function centre(sec, i, smooth = true) {
  const track = $(".track", sec), items = $$(".item", track);
  i = Math.max(0, Math.min(items.length - 1, i));
  const it = items[i];
  track.scrollTo({ left: it.offsetLeft + it.offsetWidth / 2 - track.clientWidth / 2, behavior: smooth && !reduced ? "smooth" : "auto" });
  railIndex.set(sec, i);
}
function nearest(track) {
  const mid = track.scrollLeft + track.clientWidth / 2;
  let best = 0, d = Infinity;
  $$(".item", track).forEach((it, i) => { const x = Math.abs(it.offsetLeft + it.offsetWidth / 2 - mid); if (x < d) { d = x; best = i; } });
  return best;
}
function light(sec) {
  const track = $(".track", sec), i = nearest(track), items = $$(".item", track);
  items.forEach((it, k) => it.classList.toggle("is-lit", k === i));
  if (railIndex.get(sec) !== i || !$(".caption b", sec).textContent) {
    railIndex.set(sec, i);
    const it = items[i], p = product(it.dataset.p), cap = $(".caption", sec);
    cap.classList.add("swap");
    clearTimeout(cap._t);
    cap._t = setTimeout(() => {
      $("b", cap).textContent = p.name;
      $("span", cap).textContent = `${COLOURS[it.dataset.c].name} · ${price(p.price)}`;
      cap.classList.remove("swap");
    }, reduced ? 0 : 160);
  }
}
for (const sec of $$(".scene")) {
  const track = $(".track", sec), isRail = sec.classList.contains("rail");
  let raf = 0;
  if (isRail) track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => light(sec)); }, { passive: true });
  if (!isRail) continue;
  let acc = 0, lock = 0;
  track.addEventListener("wheel", (e) => {
    const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    e.preventDefault();
    if (Date.now() < lock) return;
    acc += d;
    if (Math.abs(acc) > 30) { centre(sec, nearest(track) + Math.sign(acc)); acc = 0; lock = Date.now() + 380; }
  }, { passive: false });
  $(".prev", sec).addEventListener("click", () => centre(sec, nearest(track) - 1));
  $(".next", sec).addEventListener("click", () => centre(sec, nearest(track) + 1));
  // перетаскивание мышью
  let sx = 0, sl = 0, moved = false, down = false;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button) return;
    down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
  });
  addEventListener("pointermove", (e) => {
    if (!down) return;
    if (!moved && Math.abs(e.clientX - sx) > 6) { moved = true; track.classList.add("is-drag"); }
    if (moved) track.scrollLeft = sl - (e.clientX - sx);
  });
  addEventListener("pointerup", () => {
    if (!down) return;
    down = false;
    if (moved) { track.classList.remove("is-drag"); centre(sec, nearest(track)); track._dragged = true; setTimeout(() => (track._dragged = false), 0); }
  });
}
addEventListener("keydown", (e) => {
  if (!current || document.querySelector("dialog[open]")) return;
  if (current.classList.contains("rail") && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
    e.preventDefault();
    centre(current, nearest($(".track", current)) + (e.key === "ArrowRight" ? 1 : -1));
  }
});
addEventListener("resize", () => { if (current?.classList.contains("rail")) centre(current, railIndex.get(current) ?? 0, false); });

/* клик по вещи: вешалку сбоку сначала подвозим в центр, остальное открывает карточку */
hall.addEventListener("click", (e) => {
  const it = e.target.closest(".item");
  if (!it) return;
  const sec = it.closest(".scene"), track = it.parentElement;
  if (track._dragged) return;
  if (sec.classList.contains("rail") && !it.classList.contains("is-lit")) return centre(sec, $$(".item", track).indexOf(it));
  openProduct(it.dataset.p, it.dataset.c, it);
});

/* ── окна */
function openDialog(d) { if (!d.open) d.showModal(); }
for (const d of $$("dialog")) {
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
  $(".x", d).addEventListener("click", () => d.close());
}

/* ── карточка вещи */
const dlg = $(".product");
const state = { p: null, colour: null, size: null, qty: 1, from: null };
const stockOf = () => colourway(state.p, state.colour).stock[state.size] ?? 0;
function openProduct(pid, colour, from) {
  Object.assign(state, { p: product(pid), colour, size: null, qty: 1, from });
  if (state.p.sizes.length === 1) state.size = state.p.sizes[0];
  renderProduct(true);
  openDialog(dlg);
}
function renderProduct(photos) {
  const { p } = state, w = colourway(p, state.colour);
  $("#p-title").textContent = p.name;
  $(".p-price").textContent = price(p.price);
  $(".p-colour-name").textContent = COLOURS[state.colour].name;
  if (photos) {
    const box = $(".p-photos");
    box.innerHTML = w.photos.map((v, i) => `<img src="${photoSrc(v)}" alt="${i ? PHOTO_ALT[v] ?? p.name : `${p.name}, ${COLOURS[state.colour].name}`}" width="720" height="900" ${i ? 'loading="lazy"' : ""}>`).join("");
    box.scrollLeft = 0;
    $(".p-dots").innerHTML = w.photos.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("");
  }
  $(".swatches").innerHTML = p.colourways.map((c) =>
    `<button type="button" class="swatch" style="--c:${COLOURS[c.colour].swatch}" aria-pressed="${c.colour === state.colour}" aria-label="${COLOURS[c.colour].name}"><i></i></button>`).join("");
  $$(".swatch").forEach((b, i) => b.addEventListener("click", () => {
    state.colour = p.colourways[i].colour;
    if (state.size && !stockOf()) state.size = null;
    state.qty = 1; renderProduct(true);
  }));
  $(".sizes").innerHTML = p.sizes.map((s) => {
    const n = w.stock[s] ?? 0;
    return `<button type="button" class="size" data-s="${s}" aria-pressed="${s === state.size}" ${n ? "" : `disabled title="Нет в наличии"`}>${sizeLabel(s)}</button>`;
  }).join("");
  $$(".size").forEach((b) => b.addEventListener("click", () => {
    state.size = b.dataset.s; state.qty = Math.min(state.qty, stockOf());
    $(".p-error").textContent = ""; renderProduct(false);
  }));
  const max = state.size ? Math.min(stockOf(), 9) : 9;
  $(".qty-value", dlg).textContent = state.qty;
  $(".qty-minus", dlg).disabled = state.qty <= 1;
  $(".qty-plus", dlg).disabled = state.qty >= max;
  const left = state.size && stockOf() <= 3 ? `<dt>Остаток</dt><dd>${stockOf()} шт. в размере ${sizeLabel(state.size)}</dd>` : "";
  $(".p-facts").innerHTML = `<dt>Ткань</dt><dd>${p.fabric}</dd><dt>Посадка</dt><dd>${p.fit}</dd><dt>Детали</dt><dd>${p.details.join(". ")}.</dd>${left}`;
}
$(".p-photos").addEventListener("scroll", (e) => {
  const i = Math.round(e.target.scrollLeft / e.target.clientWidth);
  $$(".p-dots i").forEach((d, k) => d.classList.toggle("on", k === i));
}, { passive: true });
$(".qty-minus", dlg).addEventListener("click", () => { state.qty = Math.max(1, state.qty - 1); renderProduct(false); });
$(".qty-plus", dlg).addEventListener("click", () => { state.qty += 1; renderProduct(false); });
const addBtn = $(".add");
addBtn.addEventListener("click", async () => {
  if (addBtn.classList.contains("is-done")) return;
  if (!state.size) {
    $(".p-error").textContent = "Выберите размер.";
    addBtn.classList.remove("shake"); addBtn.offsetWidth; addBtn.classList.add("shake");
    return;
  }
  addToCart(state.p.id, state.colour, state.size, state.qty);
  addBtn.classList.add("is-done");
  $("span", addBtn).textContent = "Добавлено ✓";
  await wait(750);
  const from = state.from;
  dlg.close();
  fly(from);
  await wait(400);
  addBtn.classList.remove("is-done");
  $("span", addBtn).textContent = "В корзину";
});

/* вещь улетает в корзину */
function fly(from) {
  const src = from?.querySelector(".garment"), to = $(".cart-btn svg");
  bumpCart();
  if (!src || reduced) return;
  const a = src.getBoundingClientRect(), b = to.getBoundingClientRect();
  const el = src.cloneNode(); el.className = "fly";
  Object.assign(el.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
  document.body.append(el);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  el.animate([
    { transform: "translate(0,0) scale(1)", opacity: 1 },
    { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 60}px) scale(.45)`, opacity: 1, offset: 0.6 },
    { transform: `translate(${dx}px, ${dy}px) scale(.06)`, opacity: 0.2 },
  ], { duration: 820, easing: "cubic-bezier(.5,0,.3,1)" }).finished.then(() => { el.remove(); bumpCart(); });
}
function bumpCart() { const c = $(".cart-btn"); c.classList.remove("bump"); c.offsetWidth; c.classList.add("bump"); }

/* ── корзина */
const KEY = "void-cart";
let cart = [];
try { cart = JSON.parse(localStorage.getItem(KEY)) ?? []; } catch { cart = []; }
cart = cart.filter((l) => product(l.p) && l.qty > 0);
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch {} };
function addToCart(p, colour, size, qty) {
  const line = cart.find((l) => l.p === p && l.c === colour && l.s === size);
  const max = colourway(product(p), colour).stock[size] ?? 0;
  if (line) line.qty = Math.min(max, line.qty + qty); else cart.push({ p, c: colour, s: size, qty: Math.min(max, qty) });
  save(); renderCart();
}
function renderCart() {
  const n = cart.reduce((s, l) => s + l.qty, 0), sum = cart.reduce((s, l) => s + l.qty * product(l.p).price, 0);
  const badge = $(".cart-count");
  badge.hidden = !n; badge.textContent = n;
  $(".cart-btn").setAttribute("aria-label", `Корзина, вещей: ${n}`);
  $(".c-empty").hidden = !!n; $(".c-foot").hidden = !n;
  $(".c-lines").innerHTML = cart.map((l, i) => {
    const p = product(l.p), max = colourway(p, l.c).stock[l.s] ?? 0;
    return `<li class="c-line" data-i="${i}">
      <div class="c-thumb"><img src="${cutSrc(l.p, l.c)}" alt="" loading="lazy"></div>
      <div><h3>${p.name}</h3><p>${COLOURS[l.c].name} · ${sizeLabel(l.s)}</p>
        <div class="qty"><button type="button" data-a="-" aria-label="Меньше" ${l.qty <= 1 ? "disabled" : ""}>−</button><output>${l.qty}</output><button type="button" data-a="+" aria-label="Больше" ${l.qty >= max ? "disabled" : ""}>+</button></div>
        <button type="button" class="del" data-a="x">Удалить</button></div>
      <b>${price(p.price * l.qty)}</b></li>`;
  }).join("");
  $(".c-sum b").textContent = price(sum);
  $(".c-ship").textContent = sum >= FREE_SHIPPING ? "Доставка бесплатно" : `До бесплатной доставки ${price(FREE_SHIPPING - sum)}`;
}
$(".c-lines").addEventListener("click", (e) => {
  const a = e.target.closest("[data-a]")?.dataset.a, i = +e.target.closest(".c-line")?.dataset.i;
  if (!a) return;
  if (a === "x") cart.splice(i, 1);
  else cart[i].qty += a === "+" ? 1 : -1;
  save(); renderCart();
});
$(".cart-btn").addEventListener("click", () => { $(".c-note").hidden = true; openDialog($(".cart")); });
$(".checkout").addEventListener("click", () => ($(".c-note").hidden = false));
renderCart();

/* ── старт: свет включается в первой сцене (или в той, что в адресе) */
const start = SCENES.some((s) => s.id === location.hash.slice(1)) ? location.hash.slice(1) : SCENES[0].id;
go(start, true);
addEventListener("hashchange", () => go(location.hash.slice(1)));
