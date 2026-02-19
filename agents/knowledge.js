// agents/knowledge.js
const PROPERTY_INFO = {
  name: "De Royal Nirwana",
  developer: "De Royal Group",
  location: "Jl. Rawisari, Mulyorejo, Sukun, Kota Malang",
  bookingFee: 10000000,
  dpNormal: 0.3,
  dpMinimum: 0.1,
  inHouseMaxYears: 2,
  kprMaxYears: 15,
  partnerBanks: ["BTN", "Bank Jatim", "Bank BSI"],
  bankNote: "Fleksibel dengan bank pilihan user di luar PKS.",
  bpjsRules: "Wajib ikut minimal 3 program BPJS dan sudah menjadi peserta BPJS selama minimal 2 tahun.",
  promoActive: "Cashback Rp 5 Juta berlaku sampai akhir Februari 2026.",
};

const UNIT_TYPES = [
  { type: "25/60", landArea: 60, status: "inden", cashPrice: 265000000, description: "Type 25 — LB 25m², LT 60m². Cocok untuk pasangan muda.", assetTag: "type25" },
  { type: "30/60", landArea: 60, status: "inden", cashPrice: 285000000, description: "Type 30 — LB 30m², LT 60m². Layout 2 kamar tidur efisien.", assetTag: "type30" },
  { type: "45/60", landArea: 60, status: "inden", cashPrice: 460000000, description: "Type 45 — LB 45m², LT 60m². Premium inden.", assetTag: "type45" },
  { type: "29/60", landArea: 60, status: "ready_stock", kavling: "22", cashPrice: 300000000, description: "Type 29 Ready Stock — Kavling 22. Siap huni.", assetTag: "type22" },
  { type: "26/60", landArea: 60, status: "ready_stock", kavling: "55A", cashPrice: 285000000, description: "Type 26 Ready Stock — Kavling 55A. Siap huni.", assetTag: "type55A" },
  { type: "34/60", landArea: 60, status: "ready_stock", kavling: "52", cashPrice: 330000000, description: "Type 34 Ready Stock — Kavling 52. Siap huni.", assetTag: "type52" },
  { type: "34/60", landArea: 60, status: "ready_stock", kavling: "43", cashPrice: 330000000, description: "Type 34 Ready Stock — Kavling 43. Siap huni.", assetTag: "type43" },
];

const KAVLING_READY = UNIT_TYPES.filter(u => u.kavling).map(u => u.kavling);

const REQUIRED_DOCUMENTS = {
  umum: ["FC KTP", "Kartu Keluarga (KK)", "NPWP", "Surat Nikah", "Tabungan 3 bulan terakhir", "Pas foto 2x4 warna"],
  pns: ["SK Pengangkatan", "Slip Gaji", "SK Penghasilan"],
  swasta: ["Slip Gaji / SK Penghasilan dari perusahaan", "SK Kerja"],
  wiraswasta: ["FC SIUP", "TDP", "NPWP Usaha", "Rekening Koran 6 bulan terakhir"],
};

const ASSET_MAP = [
  { tag: "pricelist", type: "document", paths: ["public/pricelist.pdf"], description: "Pricelist De Royal Nirwana" },
  { tag: "pricelist_img", type: "image", paths: ["public/pricelist.png"], description: "Pricelist De Royal Nirwana (gambar)" },
  { tag: "katalog", type: "document", paths: ["public/katalog.pdf"], description: "Katalog lengkap De Royal Nirwana" },
  { tag: "siteplan", type: "image", paths: ["public/siteplan/siteplan.jpg"], description: "Siteplan De Royal Nirwana" },
  { tag: "type25", type: "image", paths: ["public/scandinavian/type25/rumah.jpg", "public/scandinavian/type25/denah.jpg"], description: "Foto & Denah Type 25" },
  { tag: "type30", type: "image", paths: ["public/scandinavian/type30/rumah.jpg", "public/scandinavian/type30/denah.jpg"], description: "Foto & Denah Type 30" },
  { tag: "type45", type: "image", paths: ["public/scandinavian/type45/rumah.jpg", "public/scandinavian/type45/denah.jpg"], description: "Foto & Denah Type 45" },
  { tag: "type22", type: "image", paths: ["public/readystok/type22/rumah.jpg", "public/readystok/type22/denah.jpg"], description: "Foto & Denah Kavling 22" },
  { tag: "type43", type: "image", paths: ["public/readystok/type43/rumah.jpg", "public/readystok/type43/denah.jpg"], description: "Foto & Denah Kavling 43" },
  { tag: "type52", type: "image", paths: ["public/readystok/type52/rumah.jpg", "public/readystok/type52/denah.jpg"], description: "Foto & Denah Kavling 52" },
  { tag: "type55A", type: "image", paths: ["public/readystok/type55A/rumah.jpg", "public/readystok/type55A/denah.jpg"], description: "Foto & Denah Kavling 55A" },
  { tag: "video_lokasi", type: "document", paths: ["public/video/video_lokasi.mp4"], description: "Video Lokasi" },
  { tag: "video_ready", type: "document", paths: ["public/video/video_ready.mp4"], description: "Video Ready Stock" },
];

function getUnitByKavling(kav) {
  return UNIT_TYPES.find(u => u.kavling && String(u.kavling).toUpperCase() === String(kav).toUpperCase()) || null;
}

function getAssetByTag(rawTag) {
  if (!rawTag) return null;
  const tag = String(rawTag).toLowerCase().trim();
  let found = ASSET_MAP.find(a => a.tag.toLowerCase() === tag);
  if (found) return found;
  if (/^\d+[A-Za-z]?$/.test(tag)) {
    const unit = getUnitByKavling(tag.toUpperCase());
    if (unit && unit.assetTag) {
      found = ASSET_MAP.find(a => a.tag.toLowerCase() === unit.assetTag.toLowerCase());
      if (found) return found;
    }
  }
  const maybeType = tag.startsWith("type") ? tag : `type${tag}`;
  found = ASSET_MAP.find(a => a.tag.toLowerCase() === maybeType.toLowerCase());
  return found || null;
}

function parseAssetTags(response) {
  // ✅ REGEX BENAR (escape bracket)
  const tagRegex = /\[SEND:([A-Za-z0-9_]+)\]/gi;
  const assets = [];
  let match;
  while ((match = tagRegex.exec(response)) !== null) {
    const asset = getAssetByTag(match[1]);
    if (asset) assets.push(asset);
  }
  const cleanText = response.replace(tagRegex, "").replace(/\s{2,}/g, " ").trim();
  return { cleanText, assets };
}

function buildKnowledgeString() {
  const units = UNIT_TYPES.map(u =>
    `- Type ${u.type}${u.kavling ? ` (Kavling ${u.kavling})` : ""}: Rp ${(u.cashPrice / 1000000).toFixed(0)} Juta [${u.status === "ready_stock" ? "READY STOCK" : "INDEN"}] — ${u.description} [AssetTag:${u.assetTag}]`
  ).join("\n");

  return `
=== DE ROYAL NIRWANA — KNOWLEDGE BASE ===
📍 LOKASI: ${PROPERTY_INFO.location}
💰 BOOKING: Rp ${(PROPERTY_INFO.bookingFee / 1000000).toFixed(0)} Juta
📊 DP: ${(PROPERTY_INFO.dpNormal * 100)}% atau ${(PROPERTY_INFO.dpMinimum * 100)}%
🏦 BANK: ${PROPERTY_INFO.partnerBanks.join(", ")}
🎯 PROMO: ${PROPERTY_INFO.promoActive}
SKEMA:
Cash
InHouse max ${PROPERTY_INFO.inHouseMaxYears} tahun
KPR max ${PROPERTY_INFO.kprMaxYears} tahun
UNIT:
${units}
READY STOCK: ${KAVLING_READY.join(", ")}
DOKUMEN UMUM: ${REQUIRED_DOCUMENTS.umum.join(", ")}
BPJS: ${PROPERTY_INFO.bpjsRules}

ATURAN PENTING:
1. Jika user minta "price list", "PL", "daftar harga" → WAJIB jawab: [SEND:pricelist]
2. Jika user minta foto/denah unit → WAJIB pakai [SEND:tag] sesuai AssetTag
3. JANGAN mengarang data di luar knowledge base ini.
`.trim();
}

module.exports = {
  PROPERTY_INFO, UNIT_TYPES, KAVLING_READY, REQUIRED_DOCUMENTS, ASSET_MAP,
  getUnitByKavling, getAssetByTag, parseAssetTags, buildKnowledgeString
};