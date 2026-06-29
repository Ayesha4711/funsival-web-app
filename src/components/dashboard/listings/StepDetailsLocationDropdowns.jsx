"use client";

import React, { useMemo } from "react";
import { Country, State, City } from "country-state-city";
import { ComboboxField } from "@/components/shared/FieldControls";
import { Label, FieldError } from "./StepDetailsFieldControls";

/* Match a raw city name from Nominatim against the country-state-city library */
export function resolveCity(rawCity, countryCode, stateCode) {
  if (!rawCity || !countryCode) return rawCity || "";
  const lower = rawCity.toLowerCase();

  // 1. Try exact match within the state
  if (stateCode) {
    const stateCities = City.getCitiesOfState(countryCode, stateCode);
    const exact = stateCities.find(c => c.name.toLowerCase() === lower);
    if (exact) return exact.name;
    const partial = stateCities.find(c =>
      c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
    );
    if (partial) return partial.name;
  }

  // 2. Fall back: search all cities in the country (Nominatim city may belong to a neighbouring state)
  const allStates = State.getStatesOfCountry(countryCode);
  for (const st of allStates) {
    const cities = City.getCitiesOfState(countryCode, st.isoCode);
    const exact = cities.find(c => c.name.toLowerCase() === lower);
    if (exact) return exact.name;
  }
  for (const st of allStates) {
    const cities = City.getCitiesOfState(countryCode, st.isoCode);
    const partial = cities.find(c =>
      c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
    );
    if (partial) return partial.name;
  }

  // 3. Return the raw string as last resort (won't match dropdown but keeps the value visible)
  return rawCity;
}

/* ─── Location cascading dropdowns ──────────────────────────────────────────── */
export default function LocationDropdowns({ country, state, city, onCountryChange, onStateChange, onCityChange, errors }) {
  const countryOptions = useMemo(
    () => Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name })),
    []
  );
  const stateOptions = useMemo(
    () => country ? State.getStatesOfCountry(country).map(s => ({ value: s.isoCode, label: s.name })) : [],
    [country]
  );
  const cityOptions = useMemo(
    () => (country && state) ? City.getCitiesOfState(country, state).map(c => ({ value: c.name, label: c.name })) : [],
    [country, state]
  );

  const handleCountryChange = (val) => {
    onCountryChange(val);
    onStateChange("");
    onCityChange("");
  };

  const handleStateChange = (val) => {
    onStateChange(val);
    onCityChange("");
  };

  return (
    <>
      <div>
        <Label required>Country</Label>
        <ComboboxField
          value={country}
          placeholder="Select country"
          options={countryOptions}
          onChange={handleCountryChange}
          error={!!errors?.country}
        />
        <FieldError msg={errors?.country} />
      </div>
      <div>
        <Label required>State / Province</Label>
        <ComboboxField
          value={state}
          placeholder={country ? (stateOptions.length ? "Select state" : "No states available") : "Select country first"}
          options={stateOptions}
          onChange={handleStateChange}
          disabled={!country || stateOptions.length === 0}
          error={!!errors?.state}
        />
        <FieldError msg={errors?.state} />
      </div>
      <div>
        <Label required>City</Label>
        <ComboboxField
          value={city}
          placeholder={state ? (cityOptions.length ? "Select city" : "No cities available") : "Select state first"}
          options={cityOptions}
          onChange={onCityChange}
          disabled={!state || cityOptions.length === 0}
          error={!!(errors?.city || errors?.placeCity)}
        />
        <FieldError msg={errors?.city || errors?.placeCity} />
      </div>
    </>
  );
}
