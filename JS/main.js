/* ============================================================
   D&D GLOWY · JavaScript principal
   Funciones: render del catálogo, filtros, búsqueda, carrito,
   envío de pedido por WhatsApp, cuenta regresiva, animaciones.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Utilidades ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Formatea un número como precio en soles peruanos
  const soles = (n) =>
    "S/ " + Number(n).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Muestra un aviso flotante
  let toastTimer;
  function toast(message, icon = "fa-circle-check") {
    const el = $("#toast");
    if (!el) return;
    el.innerHTML = '<i class="fa-solid ' + icon + '"></i>' + message;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 2600);
  }

  /* ============================================================
     1. RENDER DEL CATÁLOGO
     ============================================================ */
  const grid = $("#products-grid");
  const emptyState = $("#empty-state");
  let activeFilter = "todos";
  let searchTerm = "";
  let sortMode = "default";

  function sortCatalog(products) {
    if (sortMode === "asc") products.sort((a, b) => a.price - b.price);
    else if (sortMode === "desc") products.sort((a, b) => b.price - a.price);
    else if (sortMode === "rating") products.sort((a, b) => b.rating - a.rating);
  }

  function badgeHTML(badges) {
    return (badges || [])
      .map((b) => '<span class="badge badge--' + b.type + '">' + b.text + "</span>")
      .join("");
  }

  function includesHTML(list) {
    return (list || []).map((i) => "<span>" + i + "</span>").join("");
  }

  function productCard(p) {
    const art = document.createElement("article");
    art.className = "product";
    art.dataset.category = p.category;
    art.innerHTML =
      '<div class="product__media">' +
        '<div class="product__badges">' + badgeHTML(p.badges) + "</div>" +
        '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy" decoding="async" />' +
      "</div>" +
      '<div class="product__body">' +
        '<p class="product__cat">' + p.categoryName + "</p>" +
        "<h3 class=\"product__name\">" + p.name + "</h3>" +
        '<p class="product__desc">' + p.desc + "</p>" +
        '<div class="product__rating">' +
          "★".repeat(Math.round(p.rating)) +
          '<span>(' + p.rating.toFixed(1) + " · " + p.reviews + " opiniones)</span>" +
        "</div>" +
        '<div class="product__includes">' + includesHTML(p.includes) + "</div>" +
        '<div class="product__foot">' +
          '<div class="product__prices">' +
            '<span class="price-old">' + soles(p.priceOld) + "</span>" +
            '<span class="price-now">' + soles(p.price).replace("S/ ", "S/&nbsp;") + "</span>" +
          "</div>" +
          '<button class="product__add" data-add="' + p.id + '" aria-label="Agregar ' + p.name + ' al carrito">' +
            '<i class="fa-solid fa-plus"></i>' +
          "</button>" +
        "</div>" +
      "</div>";
    return art;
  }

  function renderCatalog() {
    if (!grid) return;
    const term = searchTerm.trim().toLowerCase();
    const list = CATALOG.filter((p) => {
      const okCat = activeFilter === "todos" || p.category === activeFilter;
      const okTxt =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.desc.toLowerCase().includes(term) ||
        p.categoryName.toLowerCase().includes(term) ||
        (p.includes || []).join(" ").toLowerCase().includes(term);
      return okCat && okTxt;
    });

    sortCatalog(list);
    grid.innerHTML = "";
    list.forEach((p, i) => {
      const card = productCard(p);
      card.style.animationDelay = i * 60 + "ms";
      grid.appendChild(card);
    });

    if (emptyState) emptyState.hidden = list.length !== 0;
  }

  /* ============================================================
     2. FILTROS Y BÚSQUEDA
     ============================================================ */
  function initFilters() {
    $$(".filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".filter").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        $$(".filter").filter((other) => other !== btn).forEach((other) => other.setAttribute("aria-pressed", "false"));
        activeFilter = btn.dataset.filter;
        renderCatalog();
      });
    });

    $$(".cat-card").forEach((card) => {
      card.addEventListener("click", () => {
        const f = card.dataset.filter;
        const target = $$(".filter").find((b) => b.dataset.filter === f);
        if (target) target.click();
        $("#packs").scrollIntoView({ behavior: "smooth" });
      });
    });

    const input = $("#search-input");
    if (input) {
      input.addEventListener("input", (e) => {
        searchTerm = e.target.value;
        renderCatalog();
      });
    }
  }

  /* ============================================================
     3. CARRITO
     ============================================================ */
  const STORAGE_KEY = "ddglowy_cart_v1";
  let cart = loadCart();

  function loadCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) {}
  }
  function findProduct(id) {
    return CATALOG.find((p) => p.id === id);
  }

  function addToCart(id, qty = 1) {
    const p = findProduct(id);
    if (!p) return;
    const item = cart.find((c) => c.id === id);
    if (item) item.qty += qty;
    else cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: qty });
    saveCart();
    updateCartUI();
    bumpCartIcon();
    toast("Agregado: " + p.name, "fa-bag-shopping");
    openCart();
  }

  function changeQty(id, delta) {
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter((c) => c.id !== id);
    saveCart();
    updateCartUI();
  }

  function removeItem(id) {
    cart = cart.filter((c) => c.id !== id);
    saveCart();
    updateCartUI();
  }

  function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
    toast("Carrito vaciado", "fa-trash-can");
  }

  function cartTotals() {
    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const units = cart.reduce((s, c) => s + c.qty, 0);
    const shipping = subtotal === 0 ? 0 : subtotal >= 150 ? 0 : 12;
    return { subtotal, units, shipping, total: subtotal + shipping };
  }

  function bumpCartIcon() {
    const badge = $("#cart-count");
    if (!badge) return;
    badge.classList.remove("is-bump");
    void badge.offsetWidth;
    badge.classList.add("is-bump");
  }

  function updateCartUI() {
    const countEl = $("#cart-count");
    const body = $("#cart-items");
    const { subtotal, units, shipping, total } = cartTotals();

    if (countEl) countEl.textContent = units;
    if ($("#cart-subtotal")) $("#cart-subtotal").textContent = soles(subtotal);
    if ($("#cart-shipping")) $("#cart-shipping").textContent = subtotal === 0 ? "Por calcular" : shipping === 0 ? "¡Gratis!" : soles(shipping);
    if ($("#cart-total")) $("#cart-total").textContent = soles(total);

    if (!body) return;
    if (cart.length === 0) {
      body.innerHTML =
        '<div class="cart-empty">' +
          '<i class="fa-solid fa-bag-shopping"></i>' +
          "<p>Tu carrito está vacío.<br />¡Elige tu pack favorito y brilla! ✨</p>" +
        "</div>";
      return;
    }

    body.innerHTML = cart
      .map(
        (c) =>
          '<div class="cart-item">' +
            '<img src="' + c.image + '" alt="' + c.name + '" />' +
            '<div class="cart-item__info">' +
              "<h4>" + c.name + "</h4>" +
              "<p>" + soles(c.price) + "</p>" +
              '<div class="cart-item__qty">' +
                '<button data-minus="' + c.id + '" aria-label="Quitar una unidad"><i class="fa-solid fa-minus"></i></button>' +
                "<span>" + c.qty + "</span>" +
                '<button data-plus="' + c.id + '" aria-label="Agregar una unidad"><i class="fa-solid fa-plus"></i></button>' +
              "</div>" +
            "</div>" +
            '<button class="cart-item__remove" data-remove="' + c.id + '" aria-label="Eliminar del carrito"><i class="fa-solid fa-xmark"></i></button>' +
          "</div>"
      )
      .join("");
  }

  /* ---------- Abrir / cerrar carrito ---------- */
  function openCart() {
    const cartEl = $("#cart");
    const overlay = $("#cart-overlay");
    if (!cartEl) return;
    cartEl.inert = false;
    cartEl.classList.add("is-open");
    cartEl.setAttribute("aria-hidden", "false");
    if (overlay) overlay.hidden = false;
    document.body.style.overflow = "hidden";
    const closeButton = $("#cart-close");
    if (closeButton) closeButton.focus();
  }
  function closeCart() {
    const cartEl = $("#cart");
    const overlay = $("#cart-overlay");
    if (!cartEl || !cartEl.classList.contains("is-open")) return;
    cartEl.classList.remove("is-open");
    cartEl.setAttribute("aria-hidden", "true");
    cartEl.inert = true;
    if (overlay) overlay.hidden = true;
    document.body.style.overflow = "";
    const openButton = $("#cart-open");
    if (openButton) openButton.focus();
  }

  /* ============================================================
     4. PEDIDO POR WHATSAPP
     ============================================================ */
  function buildWhatsAppMessage() {
    const { subtotal, shipping, total } = cartTotals();
    const name = ($("#customer-name") && $("#customer-name").value.trim()) || "";
    const place = ($("#customer-place") && $("#customer-place").value.trim()) || "";

    let msg = "¡Hola D&D Glowy! ✨ Quiero hacer este pedido:\n\n";
    cart.forEach((c, i) => {
      msg += (i + 1) + ". " + c.name + " x" + c.qty + " — " + soles(c.price * c.qty) + "\n";
    });
    msg += "\nSubtotal: " + soles(subtotal);
    msg += "\nEnvío: " + (shipping === 0 ? "Gratis / por confirmar" : soles(shipping));
    msg += "\n*TOTAL: " + soles(total) + "*";
    if (name) msg += "\n\nNombre: " + name;
    if (place) msg += "\nEntrega en: " + place;
    msg += "\n\nQuedo atenta a la confirmación. ¡Gracias!";
    return msg;
  }

  function sendOrder() {
    if (cart.length === 0) {
      toast("Tu carrito está vacío. Agrega un pack primero 😊", "fa-triangle-exclamation");
      return;
    }
    const name = $("#customer-name");
    const place = $("#customer-place");
    if (name && !name.value.trim()) {
      toast("Escribe tu nombre para continuar ✍️", "fa-triangle-exclamation");
      name.focus();
      return;
    }
    if (place && !place.value.trim()) {
      toast("Indica tu distrito o ciudad de entrega 📍", "fa-triangle-exclamation");
      place.focus();
      return;
    }
    const msg = buildWhatsAppMessage();
    const url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(msg);

    // Guardamos el pedido (queda registrado para la tienda)
    saveOrderToStore();

    window.open(url, "_blank", "noopener");
    const modal = $("#modal-overlay");
    if (modal) {
      modal.hidden = false;
      const closeButton = $("#modal-close");
      if (closeButton) closeButton.focus();
      const modalLink = $("#modal-wa");
      if (modalLink) modalLink.href = url;
    }
    toast("Abriendo WhatsApp con tu pedido 🎉", "fa-brands fa-whatsapp");
  }

  /* ---------- Registro del pedido en la API de tablas ----------
     Se guarda de forma silenciosa: si la API no está disponible
     (por ejemplo al abrir el archivo localmente en Visual Studio),
     el pedido igualmente se envía por WhatsApp sin mostrar errores. */
  function saveOrderToStore() {
    const { subtotal, shipping, total } = cartTotals();
    const payload = {
      customer_name: ($("#customer-name") && $("#customer-name").value.trim()) || "Cliente web",
      customer_place: ($("#customer-place") && $("#customer-place").value.trim()) || "No indicado",
      phone: WHATSAPP_NUMBER,
      items: cart.map((c) => c.name + " x" + c.qty).join(" | "),
      units: cart.reduce((s, c) => s + c.qty, 0),
      subtotal: subtotal,
      shipping: shipping,
      total: total,
      status: "nuevo"
    };
    try {
      fetch("tables/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {
      /* Silencioso: el pedido igual se envía por WhatsApp */
    }
  }

  /* ============================================================
     5. CUENTA REGRESIVA DE LA PROMO
     ============================================================ */
  function initTimer() {
    const endsAt = (() => {
      const stored = Number(localStorage.getItem("ddglowy_promo_end"));
      if (stored && stored > Date.now()) return stored;
      const next = Date.now() + 1000 * 60 * 60 * 48; // 48 horas
      try { localStorage.setItem("ddglowy_promo_end", String(next)); } catch (e) {}
      return next;
    })();

    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const diff = Math.max(0, endsAt - Date.now());
      const s = Math.floor(diff / 1000);
      const d = Math.floor(s / 86400);
      const h = Math.floor((s % 86400) / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      if ($("#t-days")) $("#t-days").textContent = pad(d);
      if ($("#t-hours")) $("#t-hours").textContent = pad(h);
      if ($("#t-mins")) $("#t-mins").textContent = pad(m);
      if ($("#t-secs")) $("#t-secs").textContent = pad(sec);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ============================================================
     6. MENÚ MÓVIL, CABECERA Y NAVEGACIÓN
     ============================================================ */
  function initUI() {
    const burger = $("#burger");
    const nav = $("#nav");
    if (burger && nav) {
      const mobileMenu = window.matchMedia("(max-width: 900px)");
      const syncMenuAvailability = () => {
        if (mobileMenu.matches) nav.inert = !nav.classList.contains("is-open");
        else {
          nav.inert = false;
          nav.classList.remove("is-open");
          burger.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          burger.setAttribute("aria-label", "Abrir menú");
        }
      };
      syncMenuAvailability();
      mobileMenu.addEventListener("change", syncMenuAvailability);
      burger.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        burger.classList.toggle("is-open", open);
        nav.inert = mobileMenu.matches && !open;
        burger.setAttribute("aria-expanded", String(open));
        burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      });
      $$(".nav__link").forEach((a) =>
        a.addEventListener("click", () => {
          nav.classList.remove("is-open");
          nav.inert = mobileMenu.matches;
          burger.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          burger.setAttribute("aria-label", "Abrir menú");
        })
      );
    }

    // Sombra de la cabecera al hacer scroll + botón "volver arriba"
    const header = $("#header");
    const toTop = $("#to-top");
    const onScroll = () => {
      const y = window.scrollY;
      if (header) header.classList.toggle("is-stuck", y > 20);
      if (toTop) toTop.classList.toggle("is-show", y > 500);

      // Resaltar el enlace de la sección visible
      const links = $$(".nav__link");
      let current = "inicio";
      $$("main section[id]").forEach((sec) => {
        if (window.scrollY >= sec.offsetTop - 140) current = sec.id;
      });
      links.forEach((l) => {
        const isCurrent = l.getAttribute("href") === "#" + current;
        l.classList.toggle("is-active", isCurrent);
        if (isCurrent) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toTop) toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    const progress = $("#scroll-progress");
    if (progress) {
      const updateProgress = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const value = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
        progress.style.transform = "scaleX(" + value + ")";
      };
      window.addEventListener("scroll", updateProgress, { passive: true });
      updateProgress();
    }
  }

  /* ============================================================
     7. PREFERENCIAS, ASISTENTE Y ACCESIBILIDAD
     ============================================================ */
  function initExtras() {
    const root = document.documentElement;
    const storageKey = "ddglowy_prefs_v1";
    const defaults = { theme: "dark", text: "md", font: "glowy", motion: "full" };
    const allowed = {
      theme: ["dark", "light", "contrast"],
      text: ["sm", "md", "lg", "xl"],
      font: ["glowy", "legible"],
      motion: ["full", "reduce"]
    };
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
    } catch (e) {
      saved = {};
    }
    const prefs = Object.assign({}, defaults);
    Object.keys(allowed).forEach((key) => {
      if (allowed[key].includes(saved[key])) prefs[key] = saved[key];
    });
    if (!saved.motion && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      prefs.motion = "reduce";
    }

    function applyPrefs() {
      root.dataset.theme = prefs.theme;
      root.dataset.text = prefs.text;
      root.dataset.font = prefs.font;
      root.dataset.motion = prefs.motion;
      $$("[data-pref]").forEach((input) => {
        if (input.type === "checkbox") input.checked = prefs.motion === "reduce";
        else input.checked = prefs[input.dataset.pref] === input.value;
      });
    }
    function savePrefs() {
      try { localStorage.setItem(storageKey, JSON.stringify(prefs)); } catch (e) {}
    }
    applyPrefs();

    const panel = $("#settings");
    const openButton = $("#settings-open");
    const closeButton = $("#settings-close");
    function closeSettings(returnFocus) {
      if (!panel || !panel.classList.contains("is-open")) return;
      panel.classList.remove("is-open");
      panel.inert = true;
      if (openButton) {
        openButton.setAttribute("aria-expanded", "false");
        openButton.setAttribute("aria-label", "Abrir configuración del sitio");
        if (returnFocus) openButton.focus();
      }
    }
    function openSettings() {
      if (!panel) return;
      panel.inert = false;
      panel.classList.add("is-open");
      if (openButton) {
        openButton.setAttribute("aria-expanded", "true");
        openButton.setAttribute("aria-label", "Cerrar configuración del sitio");
      }
      if (closeButton) closeButton.focus();
    }
    if (panel) {
      panel.addEventListener("change", (event) => {
        const input = event.target;
        if (!input.dataset || !input.dataset.pref) return;
        if (input.type === "checkbox") prefs.motion = input.checked ? "reduce" : "full";
        else if (allowed[input.dataset.pref].includes(input.value)) prefs[input.dataset.pref] = input.value;
        applyPrefs();
        savePrefs();
        toast("Preferencias guardadas", "fa-sliders");
      });
      if (closeButton) closeButton.addEventListener("click", () => closeSettings(true));
      const reset = $("#settings-reset");
      if (reset) {
        reset.addEventListener("click", () => {
          Object.assign(prefs, defaults);
          try { localStorage.removeItem(storageKey); } catch (e) {}
          applyPrefs();
          toast("Configuración restablecida", "fa-rotate-left");
        });
      }
      document.addEventListener("click", (event) => {
        if (panel.classList.contains("is-open") && !panel.contains(event.target) &&
            !(openButton && openButton.contains(event.target))) closeSettings(false);
      });
    }
    if (openButton) {
      openButton.addEventListener("click", () => {
        if (panel && panel.classList.contains("is-open")) closeSettings(true);
        else openSettings();
      });
    }

    const sortSelect = $("#sort-select");
    if (sortSelect) {
      sortSelect.addEventListener("change", () => {
        sortMode = sortSelect.value;
        renderCatalog();
      });
    }

    $$(".cat-card").forEach((card) => {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          card.click();
        }
      });
    });

    const recommendations = {
      personal: { belleza: "belleza-esencial", unas: "unas-basico", pestanas: "pestanas-inicial", cejas: "cejas-define" },
      emprender: { belleza: "belleza-premium", unas: "unas-pro", pestanas: "pestanas-pro", cejas: "cejas-pro" }
    };
    const selection = { goal: null, topic: null };
    const result = $("#quiz-result");
    function showRecommendation() {
      if (!result || !selection.goal || !selection.topic) return;
      const product = CATALOG.find((item) => item.id === recommendations[selection.goal][selection.topic]);
      if (!product) return;
      result.innerHTML =
        '<div class="quiz-card"><img src="' + product.image + '" alt="' + product.name + '" loading="lazy" decoding="async" />' +
          '<div><p class="product__cat">Te recomendamos</p><h3>' + product.name + '</h3><p>' + product.desc + '</p>' +
          '<p><span class="price-old">' + soles(product.priceOld) + '</span> <span class="price-now">' + soles(product.price) + '</span></p></div>' +
          '<button type="button" class="btn btn--primary btn--sm" data-add="' + product.id + '"><i class="fa-solid fa-cart-plus"></i> Agregar</button></div>';
    }
    $$(".quiz__opt").forEach((button) => {
      button.addEventListener("click", () => {
        button.parentElement.querySelectorAll(".quiz__opt").forEach((option) => option.setAttribute("aria-pressed", "false"));
        button.setAttribute("aria-pressed", "true");
        if (button.dataset.goal) selection.goal = button.dataset.goal;
        else selection.topic = button.dataset.topic;
        showRecommendation();
      });
    });

    const filters = $("#filters");
    if (filters) {
      $$(".filter", filters).forEach((button) => {
        button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
      });
    }
  }

  /* ============================================================
     8. EVENTOS GLOBALES
     ============================================================ */
  function initEvents() {
    // Delegación de clics para botones dinámicos
    document.addEventListener("click", (e) => {
      const add = e.target.closest("[data-add]");
      if (add) { addToCart(add.dataset.add, 1); return; }

      const plus = e.target.closest("[data-plus]");
      if (plus) { changeQty(plus.dataset.plus, 1); return; }

      const minus = e.target.closest("[data-minus]");
      if (minus) { changeQty(minus.dataset.minus, -1); return; }

      const remove = e.target.closest("[data-remove]");
      if (remove) { removeItem(remove.dataset.remove); return; }
    });

    if ($("#cart-open")) $("#cart-open").addEventListener("click", openCart);
    if ($("#cart-close")) $("#cart-close").addEventListener("click", closeCart);
    if ($("#cart-overlay")) $("#cart-overlay").addEventListener("click", closeCart);
    if ($("#clear-cart")) $("#clear-cart").addEventListener("click", clearCart);
    if ($("#send-order")) $("#send-order").addEventListener("click", sendOrder);
    if ($("#add-combo")) $("#add-combo").addEventListener("click", () => addToCart(COMBO.id, 1));
    if ($("#modal-close")) $("#modal-close").addEventListener("click", () => { $("#modal-overlay").hidden = true; });
    if ($("#modal-overlay")) {
      $("#modal-overlay").addEventListener("click", (event) => {
        if (event.target === $("#modal-overlay")) $("#modal-overlay").hidden = true;
      });
    }
    if ($("#modal-wa")) $("#modal-wa").addEventListener("click", () => { $("#modal-overlay").hidden = true; });

    // Cerrar paneles y menú con Escape
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeCart();
      const modal = $("#modal-overlay");
      if (modal) modal.hidden = true;
      const panel = $("#settings");
      if (panel && panel.classList.contains("is-open")) {
        panel.classList.remove("is-open");
        panel.inert = true;
        const settingsButton = $("#settings-open");
        if (settingsButton) {
          settingsButton.setAttribute("aria-expanded", "false");
          settingsButton.setAttribute("aria-label", "Abrir configuración del sitio");
          settingsButton.focus();
        }
      }
      const nav = $("#nav");
      const burger = $("#burger");
      if (nav && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        nav.inert = true;
        if (burger) {
          burger.classList.remove("is-open");
          burger.setAttribute("aria-expanded", "false");
          burger.setAttribute("aria-label", "Abrir menú");
          burger.focus();
        }
      }
    });
  }

  /* ============================================================
     8. INICIO
     ============================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    if ($("#year")) $("#year").textContent = new Date().getFullYear();
    renderCatalog();
    initFilters();
    initUI();
    initEvents();
    initTimer();
    updateCartUI();
    initExtras();

    // Animaciones al hacer scroll
    if (window.AOS) {
      window.AOS.init({ duration: 700, once: true, offset: 60, easing: "ease-out-cubic" });
    }
  });
})();
