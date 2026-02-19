// utils/extractor.js

function buildExtractionPrompt(userMessage) {
  return `
Ekstrak informasi berikut dari pesan user jika ada.
Jika tidak ada, isi null.

Output HARUS format JSON valid tanpa teks tambahan.

Field:
- nama
- alamat
- kemampuan_dp (angka saja)
- budget (angka saja)
- minat
- type_bangunan
- skema_pembayaran
- pekerjaan
- instansi
- rencana_survey (format YYYY-MM-DD)

Pesan user:
"${userMessage}"
`
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

module.exports = {
  buildExtractionPrompt,
  safeParseJSON
}