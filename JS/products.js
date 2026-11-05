/* ============================================================
   D&D GLOWY · Catálogo de packs
   Todos los precios están expresados en SOLES PERUANOS (S/)
   ------------------------------------------------------------
   Para cambiar un precio solo edita "price" (precio con descuento)
   y "priceOld" (precio antes / tachado). Para agregar un pack nuevo
   copia un bloque completo { ... } y pégalo antes del cierre "];"
   ============================================================ */

const WHATSAPP_NUMBER = "51912304989"; // 912 304 989 (código Perú +51)

const PACKS = [
  /* ---------------- PACKS DE BELLEZA ---------------- */
  {
    id: "belleza-esencial",
    category: "belleza",
    categoryName: "Belleza",
    name: "Pack Belleza Esencial",
    desc: "Rutina completa de cuidado diario para piel radiante y maquillaje natural.",
    includes: ["Limpiador facial", "Crema hidratante", "Sérum vitamina C", "Esponja + brocha"],
    price: 89,
    priceOld: 119,
    rating: 4.8,
    reviews: 96,
    image: "images/pack-belleza-esencial.jpg",
    badges: [{ text: "Más vendido", type: "hot" }]
  },
  {
    id: "belleza-premium",
    category: "belleza",
    categoryName: "Belleza",
    name: "Pack Belleza Premium",
    desc: "Kit de lujo con maquillaje profesional y cuidado intensivo para tu piel.",
    includes: ["Base + corrector", "Paleta de sombras", "Labial mate", "Máscara de pestañas", "Brochas pro"],
    price: 159,
    priceOld: 199,
    rating: 4.9,
    reviews: 74,
    image: "images/pack-belleza-premium.jpg",
    badges: [{ text: "Premium", type: "new" }]
  },

  /* ---------------- PACKS DE UÑAS ---------------- */
  {
    id: "unas-basico",
    category: "unas",
    categoryName: "Uñas",
    name: "Pack Uñas Básico",
    desc: "Todo lo necesario para un manicure prolijo en casa, fácil y rápido.",
    includes: ["Cortaúñas", "Lima de cristal", "Empujador", "Cepillo de uñas", "Estuche"],
    price: 69,
    priceOld: 89,
    rating: 4.7,
    reviews: 132,
    image: "images/pack-unas-basico.jpg",
    badges: [{ text: "-22%", type: "off" }]
  },
  {
    id: "unas-pro",
    category: "unas",
    categoryName: "Uñas",
    name: "Pack Uñas Pro Nail Art",
    desc: "Set profesional con pinceles, dotting tools y decoraciones para nail art.",
    includes: ["6 pinceles pro", "5 dotting tools", "Gel constructor", "Lámpara UV", "Decoraciones y glitter"],
    price: 129,
    priceOld: 159,
    rating: 4.9,
    reviews: 88,
    image: "images/pack-unas-pro.jpg",
    badges: [{ text: "Favorito", type: "hot" }, { text: "-19%", type: "off" }]
  },

  /* ---------------- PACKS DE PESTAÑAS ---------------- */
  {
    id: "pestanas-inicial",
    category: "pestanas",
    categoryName: "Pestañas",
    name: "Pack Pestañas Inicial",
    desc: "Clusters de pestañas con adhesivo y pinza para un look natural en minutos.",
    includes: ["Tray 20D + 40D", "Bond & seal", "Pinza curva", "Removedor", "Guía de aplicación"],
    price: 99,
    priceOld: 129,
    rating: 4.8,
    reviews: 115,
    image: "images/pack-pestanas-inicial.jpg",
    badges: [{ text: "Nuevo", type: "new" }]
  },
  {
    id: "pestanas-pro",
    category: "pestanas",
    categoryName: "Pestañas",
    name: "Pack Pestañas Pro Volumen",
    desc: "Kit completo de extensiones con volumen ruso para atender a tus clientas.",
    includes: ["Trays 20D/40D/60D/100D", "Pegamento profesional", "2 pinzas de precisión", "Anillos + espejo", "Cabezal de práctica"],
    price: 139,
    priceOld: 169,
    rating: 4.9,
    reviews: 63,
    image: "images/pack-pestanas-pro.jpg",
    badges: [{ text: "Emprendedoras", type: "hot" }]
  },

  /* ---------------- PACKS DE CEJAS ---------------- */
  {
    id: "cejas-define",
    category: "cejas",
    categoryName: "Cejas",
    name: "Pack Cejas Define",
    desc: "Define y rellena tus cejas con un acabado natural que dura todo el día.",
    includes: ["Lápiz de cejas", "Gel fijador", "Brocha biselada", "Plantillas", "Espejo"],
    price: 49,
    priceOld: 69,
    rating: 4.7,
    reviews: 148,
    image: "images/pack-cejas-define.jpg",
    badges: [{ text: "Precio especial", type: "off" }]
  },
  {
    id: "cejas-pro",
    category: "cejas",
    categoryName: "Cejas",
    name: "Pack Cejas Pro Studio",
    desc: "Kit profesional para diseño, laminado y fijación de cejas en salón.",
    includes: ["Kit de laminado", "Tinte para cejas", "Gel fijador pro", "Cera + bandas", "Pinza de precisión"],
    price: 104,
    priceOld: 129,
    rating: 4.8,
    reviews: 57,
    image: "images/pack-cejas-pro.jpg",
    badges: [{ text: "-19%", type: "off" }]
  }
];

/* Combo especial destacado (Promo Glowy Total) */
const COMBO = {
  id: "combo-glowy-total",
  category: "promo",
  categoryName: "Promo",
  name: "Combo Glowy Total",
  desc: "Uñas Pro + Pestañas Pro + Cejas Pro en un solo pack con 25% de descuento.",
  includes: ["Pack Uñas Pro", "Pack Pestañas Pro", "Pack Cejas Pro"],
  price: 279,
  priceOld: 372,
  rating: 5,
  reviews: 41,
  image: "images/pack-belleza-premium.jpg",
  badges: [{ text: "-25%", type: "off" }]
};

/* Lista completa para el catálogo (los packs + el combo) */
const CATALOG = PACKS.concat([COMBO]);
