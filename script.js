// Format helpers
const fmt2 = (n) => (isFinite(n) ? n.toFixed(2) : "—");
const fmtRM = (n) => (isFinite(n) ? n.toFixed(2) : "—");

// Core calculation
function compute(amount, subsidyPrice, currentPrice) {
  const amt = Number(amount), sub = Number(subsidyPrice), cur = Number(currentPrice);
  if (!(isFinite(amt) && isFinite(sub) && isFinite(cur)) || sub <= 0 || cur <= 0 || amt <= 0) {
    return { litersExact: NaN, edc: NaN, diffLiters: NaN };
  }
  const litersExact = amt / sub;
  const edc = Math.round(litersExact * cur * 100) / 100;
  const diffLiters = 0; // tiada liter bulat, jadi beza = 0
  return { litersExact, edc, diffLiters };
}

// Update card calculation
function updateCard(prefix) {
  const amountEl = document.getElementById(prefix + "Amount");
  const subsidyEl = document.getElementById(prefix + "Subsidy");
  const currentEl = document.getElementById(prefix + "Current");

  const outExact = document.getElementById(prefix + "LitersExact");
  const outEDC = document.getElementById(prefix + "EDC");
  const outDiff = document.getElementById(prefix + "Diff");

  const { litersExact, edc, diffLiters } = compute(
    amountEl.value, subsidyEl.value, currentEl.value
  );

  outExact.textContent = fmt2(litersExact);
  outEDC.textContent = fmtRM(edc);
  outDiff.textContent = isFinite(diffLiters) ? diffLiters.toFixed(2) + " L" : "—";
}

// Reset hanya kosongkan Jumlah pelanggan
function resetCard(prefix) {
  document.getElementById(prefix + "Amount").value = "";
  updateCard(prefix);
}

// Auto-fetch harga rasmi
async function updateFuelPrices() {
  const infoEl = document.getElementById("officialInfo");
  try {
    const url = "https://api.data.gov.my/data-catalogue/fuelprice?limit=1";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const latest = Array.isArray(data) ? data[0] : null;
    if (!latest) throw new Error("Tiada data");

    const dieselCur = Number(latest.diesel);
    const petrolCur = Number(latest.ron95);

    if (isFinite(dieselCur)) document.getElementById("dieselCurrent").value = dieselCur;
    if (isFinite(petrolCur)) document.getElementById("petrolCurrent").value = petrolCur;

    infoEl.textContent =
      `Harga rasmi (${latest.date}): RON95 RM${latest.ron95}, RON97 RM${latest.ron97}, `
      + `Diesel Semenanjung RM${latest.diesel}, Diesel Sabah/Sarawak RM${latest.diesel_eastmsia}, `
      + `RON95 BUDI95 RM${latest.ron95_budi95}, RON95 SKPS RM${latest.ron95_skps}. Sumber: data.gov.my`;

  } catch (err) {
    infoEl.textContent = "Gagal ambil data rasmi. Sila masukkan harga semasa secara manual.";
  } finally {
    updateCard("diesel");
    updateCard("petrol");
  }
}

// Bind input events supaya auto-kira bila isi
["diesel", "petrol"].forEach(prefix => {
  ["Amount","Subsidy","Current"].forEach(field => {
    document.getElementById(prefix + field).addEventListener("input", () => updateCard(prefix));
  });
});

// Initial
updateFuelPrices();
