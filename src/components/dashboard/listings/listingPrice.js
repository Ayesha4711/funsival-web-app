const USD = "USD";

function toNumber(value) {
  if (value === "" || value === null || value === undefined || value === 0 || value === "0") return "";
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? num : "";
}

function formatMoney(value) {
  if (value === "" || value === null || value === undefined) return "";
  const num = Number(value);
  if (!Number.isFinite(num)) return "";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
  }).format(num);
}

export function getPriceMode(category = "") {
  const key = String(category).toLowerCase();
  if (key === "equipment") return "equipment";
  if (key === "places" || key === "place") return "places";
  return "activities";
}

export function createEmptyPrice(category = "") {
  const mode = getPriceMode(category);
  if (mode === "equipment") {
    return {
      currency: USD,
      hourly: "",
      daily: "",
      delivery: { enabled: false, fee: "" },
    };
  }
  if (mode === "places") {
    return {
      currency: USD,
      billingType: "hourly",
      hourly: "",
      daily: "",
    };
  }
  return {
    currency: USD,
    perPerson: "",
  };
}

export function normalizeListingPrice(category = "", rawPrice) {
  const mode = getPriceMode(category);
  const source = rawPrice && typeof rawPrice === "object" ? rawPrice : {};
  const fallbackAmount = rawPrice && typeof rawPrice !== "object" ? rawPrice : source.amount;

  if (mode === "equipment") {
    return {
      currency: source.currency ?? USD,
      hourly: toNumber(source.hourly ?? fallbackAmount),
      daily: toNumber(source.daily),
      delivery: {
        enabled: Boolean(source.delivery?.enabled),
        fee: toNumber(source.delivery?.fee),
      },
    };
  }

  if (mode === "places") {
    const hourly = toNumber(source.hourly ?? fallbackAmount);
    const daily = toNumber(source.daily);
    return {
      currency: source.currency ?? USD,
      billingType: source.billingType ?? (daily !== "" && hourly === "" ? "daily" : "hourly"),
      hourly,
      daily,
    };
  }

  return {
    currency: source.currency ?? USD,
    perPerson: toNumber(source.perPerson ?? fallbackAmount),
  };
}

function pushIfNumber(target, key, value) {
  const num = toNumber(value);
  if (num !== "") target[key] = num;
}

export function buildListingPricePayload(category = "", price) {
  const mode = getPriceMode(category);
  const normalized = price && typeof price === "object" ? price : createEmptyPrice(category);
  const payload = { currency: normalized.currency ?? USD };

  if (mode === "equipment") {
    pushIfNumber(payload, "hourly", normalized.hourly);
    pushIfNumber(payload, "daily", normalized.daily);

    const fee = toNumber(normalized.delivery?.fee);
    if (normalized.delivery?.enabled || fee !== "") {
      payload.delivery = { enabled: Boolean(normalized.delivery?.enabled) };
      if (fee !== "") payload.delivery.fee = fee;
    }

    return payload;
  }

  if (mode === "places") {
    const billingType = normalized.billingType === "daily" ? "daily" : "hourly";
    if (billingType === "daily") {
      pushIfNumber(payload, "daily", normalized.daily || normalized.hourly);
    } else {
      pushIfNumber(payload, "hourly", normalized.hourly || normalized.daily);
    }
    return payload;
  }

  pushIfNumber(payload, "perPerson", normalized.perPerson);
  return payload;
}

export function formatListingPrice(category = "", rawPrice) {
  const mode = getPriceMode(category);
  const price = normalizeListingPrice(category, rawPrice);

  if (mode === "equipment") {
    const parts = [];
    if (price.hourly !== "") parts.push(`$${formatMoney(price.hourly)} / hr`);
    if (price.daily !== "") parts.push(`$${formatMoney(price.daily)} / day`);
    if (price.delivery?.enabled && price.delivery?.fee !== "") {
      parts.push(`Delivery $${formatMoney(price.delivery.fee)}`);
    }
    return parts.length ? parts.join(" · ") : "—";
  }

  if (mode === "places") {
    if (price.billingType === "daily") {
      return price.daily !== "" ? `$${formatMoney(price.daily)} / day` : "—";
    }
    return price.hourly !== "" ? `$${formatMoney(price.hourly)} / hr` : "—";
  }

  return price.perPerson !== "" ? `$${formatMoney(price.perPerson)} / person` : "—";
}

export function describeListingPrice(category = "", rawPrice) {
  const mode = getPriceMode(category);
  const price = normalizeListingPrice(category, rawPrice);

  if (mode === "equipment") {
    const hourly = price.hourly !== "" ? `$${formatMoney(price.hourly)} / hr` : null;
    const daily = price.daily !== "" ? `$${formatMoney(price.daily)} / day` : null;
    const delivery = price.delivery?.enabled
      ? price.delivery?.fee !== ""
        ? `Delivery fee $${formatMoney(price.delivery.fee)}`
        : "Delivery enabled"
      : null;
    return [hourly, daily, delivery].filter(Boolean);
  }

  if (mode === "places") {
    const summary = price.billingType === "daily"
      ? price.daily !== "" ? `$${formatMoney(price.daily)} / day` : null
      : price.hourly !== "" ? `$${formatMoney(price.hourly)} / hr` : null;
    return summary ? [summary] : [];
  }

  return price.perPerson !== "" ? [`$${formatMoney(price.perPerson)} / person`] : [];
}
