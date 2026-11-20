import { ZONES, PACKAGES, SERVICES, item, add, covered, total, listPrice, rub } from "./price.js";

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
let cart = new Set();

const WORKS = [
  { n: 1, title: "Полировка капота", text: "Лифтбек, 6 лет на автомойках: убрали паутинку и голограммы. 1,5 дня." },
  { n: 2, title: "Керамика", text: "Синий седан: два слоя керамики, вода собирается в капли и скатывается. 2 дня." },
  { n: 3, title: "Сколы и плёнка", text: "Белый лифтбек: локальный ремонт бампера, затем плёнка на ударную зону. 3 дня." },
  { n: 4, title: "Химчистка салона", text: "Бежевая кожа: глубокая чистка, затем защитный крем от повторных пятен. 1 день." },
  { n: 5, title: "Керамика дисков", text: "Сняли колёса, отмыли от грязи и тормозной пыли, покрыли керамикой. 1 день." },
  { n: 6, title: "Антидождь", text: "Лобовое в ливень: вода не размазывается, обзор как в сухую погоду. 2 часа." },
];

/* ── хотспоты и карточка зоны */
for (const z of ZONES) {
  const b = document.createElement("button");
  b.className = "hs"; b.type = "button"; b.dataset.zone = z.id;
  b.style.cssText = `--x:${z.x}%;--y:${z.y}%;--mx:${z.mx}%;--my:${z.my}%`;
  b.setAttribute("aria-expanded", "false");
  b.innerHTML = `<span>${z.label}</span>`;
  b.addEventListener("click", () => (b.getAttribute("aria-expanded") === "true" ? closeCard() : openZone(z)));
  $(".hotspots").append(b);
}

const card = $(".card");
let openZoneId = null;
function addButton(id) {
  const inCart = cart.has(id), viaPack = !inCart && covered(cart, id);
  const label = inCart ? "В расчёте ✓" : viaPack ? "Уже в пакете ✓" : "Добавить в расчёт";
  return `<button type="button" class="add" data-id="${id}" aria-pressed="${inCart}" ${viaPack ? "disabled" : ""}>${label}</button>`;
}
function renderCard() {
  const z = ZONES.find((x) => x.id === openZoneId);
  if (!z) return;
  $(".card-zone", card).textContent = z.label;
  $("#card-title").textContent = z.title;
  $(".card-list", card).innerHTML = z.services.map((s) => `
    <li class="svc">
      ${z.services.length > 1 ? `<h3>${s.name}</h3>` : ""}
      <p>${s.text}</p>
      <div class="meta"><span>${s.time}</span><b>от ${rub(s.price)}</b></div>
      ${addButton(s.id)}
    </li>`).join("");
}
function openZone(z) {
  openZoneId = z.id;
  $$(".hs").forEach((h) => h.setAttribute("aria-expanded", String(h.dataset.zone === z.id)));
  renderCard();
  card.hidden = false;
  card.style.animation = "none"; card.offsetWidth; card.style.animation = "";
  $("#box").classList.add("has-card");
}
function closeCard() {
  openZoneId = null;
  card.hidden = true;
  $$(".hs").forEach((h) => h.setAttribute("aria-expanded", "false"));
  $("#box").classList.remove("has-card");
}
$(".card-close").addEventListener("click", closeCard);

/* ── стенд с пакетами */
$(".boards").innerHTML = PACKAGES.map((p, i) => `
  <article class="board reveal ${p.hit ? "hit" : ""}" style="--i:${i}">
    ${p.hit ? '<span class="tag">Чаще берут</span>' : ""}
    <h3>${p.name}</h3>
    <p class="lead">${p.lead}</p>
    <ul>${p.includes.map((id) => `<li>${SERVICES[id].name}</li>`).join("")}</ul>
    <div class="price-row"><b>${rub(p.price)}</b><s>${rub(listPrice(p))}</s></div>
    <div class="meta"><span>${p.time}</span><span>выгода ${rub(listPrice(p) - p.price)}</span></div>
    <span class="add-slot" data-pack="${p.id}"></span>
  </article>`).join("");
const renderBoards = () => $$(".add-slot").forEach((s) => (s.innerHTML = addButton(s.dataset.pack)));

/* ── расчёт: одно место, где меняется корзина */
function toggle(id) {
  cart = cart.has(id) ? new Set([...cart].filter((x) => x !== id)) : add(cart, id);
  render();
}
document.addEventListener("click", (e) => {
  const b = e.target.closest(".add[data-id]");
  if (b) toggle(b.dataset.id);
});

const drawer = $(".drawer");
function render() {
  renderCard(); renderBoards();
  $$(".hs").forEach((h) => h.classList.toggle("has-picked", ZONES.find((z) => z.id === h.dataset.zone).services.some((s) => covered(cart, s.id))));
  const c = $(".calc-count");
  const was = c.textContent;
  c.hidden = cart.size === 0;
  c.textContent = cart.size;
  if (was !== String(cart.size)) { c.classList.remove("bump"); c.offsetWidth; c.classList.add("bump"); }
  $(".calc-btn").setAttribute("aria-label", `Расчёт, позиций: ${cart.size}`);

  $(".empty").hidden = cart.size > 0;
  $(".lines").innerHTML = [...cart].map((id) => {
    const it = item(id);
    const sub = it.includes ? it.includes.map((s) => SERVICES[s].name.toLowerCase()).join(", ") : it.time;
    return `<li class="line"><span><b>${it.includes ? "Пакет «" + it.name + "»" : it.name}</b><small>${sub}</small></span>
      <span>${rub(it.price)}</span><button type="button" class="x" data-remove="${id}" aria-label="Убрать: ${it.name}">×</button></li>`;
  }).join("");
  $(".sum").hidden = $(".sum-note").hidden = cart.size === 0;
  $(".sum-value").textContent = "от " + rub(total(cart));
}
$(".lines").addEventListener("click", (e) => {
  const id = e.target.closest("[data-remove]")?.dataset.remove;
  if (id) { cart.delete(id); cart = new Set(cart); render(); }
});

function openDrawer() {
  if (drawer.open) return;
  drawer.showModal();
}
$(".calc-btn").addEventListener("click", openDrawer);
$(".open-calc").addEventListener("click", openDrawer);
$(".drawer-close").addEventListener("click", () => drawer.close());
drawer.addEventListener("click", (e) => e.target === drawer && drawer.close()); // клик по фону
$$(".drawer a[href^='#']").forEach((a) => a.addEventListener("click", () => drawer.close()));

/* ── заявка */
const form = $(".order");
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
form.date.min = today;
const contactOk = (v) => {
  v = v.trim();
  if (/^@?[a-z][a-z0-9_]{4,31}$/i.test(v)) return true;               // Telegram
  return /^[+\d][\d\s()-]+$/.test(v) && v.replace(/\D/g, "").length >= 10; // телефон
};
form.addEventListener("input", (e) => { e.target.removeAttribute("aria-invalid"); $(".form-error").textContent = ""; });
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const bad = [];
  if (!form.name.value.trim()) bad.push([form.name, "Укажите имя"]);
  if (!contactOk(form.contact.value)) bad.push([form.contact, "Нужен телефон (10+ цифр) или Telegram (@username)"]);
  if (form.date.value && form.date.value < today) bad.push([form.date, "Дата уже прошла"]);
  bad.forEach(([el]) => el.setAttribute("aria-invalid", "true"));
  if (bad.length) { $(".form-error").textContent = bad[0][1]; bad[0][0].focus(); return; }
  // ponytail: демо — заявка никуда не уходит; в проде здесь fetch на бота/CRM
  const when = form.date.value ? new Date(form.date.value + "T12:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) : null;
  $(".done-text").textContent = `${form.name.value.trim()}, свяжемся по контакту ${form.contact.value.trim()}` +
    (when ? ` и подтвердим запись на ${when}.` : " и подберём удобный день.") +
    (cart.size ? ` В расчёте: ${cart.size} поз., от ${rub(total(cart))}.` : "");
  form.hidden = true; $(".done").hidden = false; $(".done").focus();
});
$(".reset").addEventListener("click", () => {
  cart = new Set(); form.reset(); form.hidden = false; $(".done").hidden = true; render();
  drawer.close(); location.hash = "#box";
});

/* ── лента работ */
const track = $(".track");
track.innerHTML = WORKS.map((w, i) => `
  <figure class="work reveal" style="--i:${i}">
    <div class="compare">
      <img src="img/w${w.n}-after.webp" alt="${w.title}: после" loading="lazy" draggable="false" width="1200" height="900">
      <img class="before" src="img/w${w.n}-before.webp" alt="${w.title}: до" loading="lazy" draggable="false" width="1200" height="900">
      <input type="range" min="0" max="100" value="50" aria-label="${w.title}: сравнение до и после">
      <span class="divider"></span>
      <span class="badge b">До</span><span class="badge a">После</span>
    </div>
    <figcaption><h3>${w.title}</h3><p>${w.text}</p></figcaption>
  </figure>`).join("");
track.addEventListener("input", (e) => e.target.closest(".compare")?.style.setProperty("--pos", e.target.value + "%"));

// колесо мыши листает ленту вбок
track.addEventListener("wheel", (e) => {
  if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
  const max = track.scrollWidth - track.clientWidth;
  if ((e.deltaY < 0 && track.scrollLeft <= 0) || (e.deltaY > 0 && track.scrollLeft >= max - 1)) return;
  e.preventDefault();
  track.scrollBy({ left: e.deltaY * 1.6, behavior: "auto" });
}, { passive: false });

// мышью — перетаскиванием (на тач-экранах работает родной свайп)
let drag = null;
track.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "mouse" || e.button !== 0 || e.target.matches("input")) return;
  drag = { x: e.clientX, left: track.scrollLeft, moved: false };
});
addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; track.classList.add("dragging"); }
  if (drag.moved) track.scrollLeft = drag.left - dx;
});
addEventListener("pointerup", () => {
  if (!drag) return;
  if (drag.moved) {
    const left = track.scrollLeft; track.classList.remove("dragging");
    track.scrollLeft = left; // снап вернётся к ближайшей карточке
  }
  drag = null;
});

const step = () => track.querySelector(".work").offsetWidth + parseFloat(getComputedStyle(track).columnGap);
$$(".arrow").forEach((a) => a.addEventListener("click", () => track.scrollBy({ left: step() * a.dataset.dir, behavior: "smooth" })));
const syncArrows = () => {
  const max = track.scrollWidth - track.clientWidth;
  $(".arrow[data-dir='-1']").disabled = track.scrollLeft < 4;
  $(".arrow[data-dir='1']").disabled = track.scrollLeft > max - 4;
};
track.addEventListener("scroll", syncArrows, { passive: true });
track.addEventListener("keydown", (e) => {
  if (e.target !== track || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
  e.preventDefault(); track.scrollBy({ left: step() * (e.key === "ArrowLeft" ? -1 : 1), behavior: "smooth" });
});

/* ── свет в боксе */
$(".light-toggle").addEventListener("click", (e) => {
  const on = document.documentElement.dataset.light !== "on";
  document.documentElement.dataset.light = on ? "on" : "off";
  e.currentTarget.setAttribute("aria-pressed", on);
  $('meta[name="theme-color"]').content = on ? "#e8e7e4" : "#0b0c0e";
});

/* ── сцены по хэшу */
function showScene() {
  const id = location.hash.slice(1);
  const target = document.getElementById(id)?.classList.contains("scene") ? id : "box";
  $$(".scene").forEach((s) => {
    const on = s.id === target;
    s.classList.toggle("is-active", on);
    s.inert = !on;
  });
  document.documentElement.dataset.scene = target;
  $$(".pill a").forEach((a) => (a.hash === "#" + target ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  if (target !== "box") closeCard();
  if (target === "works") requestAnimationFrame(syncArrows);
}
addEventListener("hashchange", showScene);
addEventListener("keydown", (e) => e.key === "Escape" && !drawer.open && closeCard());
showScene();
render();
