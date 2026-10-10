export function getListingRate(listing, mode) {
  const price = listing?.price;
  const info = listing?.basicInformation ?? {};
  const values = {
    hourly: price?.hourly ?? price?.perHour ?? info.pricePerHour,
    daily: price?.daily ?? price?.dailyRate ?? info.dailyRate,
    perPerson: price?.perPerson ?? info.pricePerPerson,
  };
  const value = Number(values[mode]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export const PRICE_LABELS = { hourly: 'Hourly', daily: 'Daily', perPerson: 'Per Person' };
