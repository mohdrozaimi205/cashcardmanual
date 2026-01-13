// Format helpers
const fmt2 = (n) => (isFinite(n) ? n.toFixed(2) : "—");
const fmtRM = (n) => (isFinite(n) ? n.toFixed(2) : "—");

// Core calculation
function compute(amount, subsidyPrice, currentPrice, literRoundPlaces = 2) {
  const amt = Number(amount), sub = Number(subsidyPrice), cur = Number(currentPrice);
  const places = Math.max(0, Math.min(6, Number(literRoundPlaces) || 2));
  if (!(isFinite(amt) && isFinite(sub) && isFinite(cur)) || sub <= 0 || cur <= 0 || amt < 0) {
    return { litersExact: NaN, litersRounded: NaN, edc: NaN, diffLiters: NaN };
  }
  const litersExact = amt / sub;
  const litersRounded = Number(litersExact.toFixed(places));
  const edc = Math.round(litersExact * cur * 100) / 100;
  const diffLiters = litersRounded - litersExact;
  return { litersExact, litersRounded, edc, diffLiters };
}

// Update card calculation
function updateCard(prefix) {
  const amountEl = document.getElementById(prefix + "Amount");
  const subsidyEl = document.getElementById(prefix + "Subsidy");
  const currentEl = document.getElementById(prefix + "Current");
  const roundEl = document.getElementById(prefix + "LiterRound");

  const outExact = document.getElementById(prefix + "LitersExact");
  const outRounded = document.getElementById(prefix + "LitersRounded");
  const outEDC = document.getElementById(prefix + "EDC");
  const outDiff = document.getElementById(prefix + "Diff");

  const { litersExact, litersRounded, edc, diffLiters } = compute(
    amountEl.value, subsidyEl.value, currentEl.value, roundEl.value
  );

  outExact.textContent = fmt2(litersExact);
  outRounded.textContent = fmt2(litersRounded);
  outEDC.textContent = fmtRM(edc);
  outDiff.textContent = isFinite(diffLiters)
    ? (diffLiters >= 0 ? "+" : "") + diffLiters.toFixed(6) + " L"
    : "—";
}

// Reset hanya Jumlah pelanggan
function resetCard(prefix) {
  document.getElementById(prefix + "Amount").value = 100;
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

// Initial
updateCard("diesel");
updateCard("petrol");
updateFuelPrices();
