// services/leadEngine.js

function determineCategory(data) {

  if (data.rencana_survey) return "hot"

  if (data.kemampuan_dp || data.budget || data.skema_pembayaran) {
    return "warm"
  }

  return "cold"
}

function buildSummary(existingSummary = "", newData = {}) {

  let summary = existingSummary || ""

  for (const key in newData) {
    if (newData[key]) {
      summary += ` ${key}: ${newData[key]};`
    }
  }

  return summary.trim()
}

module.exports = {
  determineCategory,
  buildSummary
}