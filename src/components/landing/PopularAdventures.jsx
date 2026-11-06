"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StarFilledIcon, ChevronDownIcon, ChevronRightIcon } from "@/icons";
import { fetchBrowseListings, selectActivities, selectActivitiesStatus, selectLandingSearch } from "@/store/slices/activitiesSlice";
import { navigateToListingOrLogin } from "@/lib/listingNavigation";
import { useRouter } from "next/navigation";

const OFFERED_ACTIVITY_TYPES = [
  "skydiving", "horse_riding", "scuba_diving", "paragliding",
  "zipline", "jeep_rally", "hang_glider", "bungee", "bowling",
  "trampoline", "golf", "boating", "snowboarding", "surfing",
  "adventure_atvs", "jetski",
];
const OFFERED_ACTIVITY_TYPE_SET = new Set([
  ...OFFERED_ACTIVITY_TYPES,
  "jetskiing", "jet_skiing", "boat_rentals", "atv_tours",
].map(type => type.replace(/[^a-z0-9]/gi, "").toLowerCase()));

function isOfferedActivity(listing) {
  const info = listing.basicInformation ?? {};
  const rawType = listing.type ?? listing.activityType ?? info.activityType ?? info.type ?? "";
  const type = (typeof rawType === "object" ? rawType.slug ?? rawType.value ?? rawType.name : rawType)
    .toString().replace(/[^a-z0-9]/gi, "").toLowerCase();
  return !type || OFFERED_ACTIVITY_TYPE_SET.has(type);
}

function listingInfo(listing) {
  const info = listing.basicInformation ?? {};
  const place = listing.placeLocation ?? {};
  const images = listing.photos || info.images || listing.images || [];
  const rawImage = (Array.isArray(images) ? images[0] : images) || listing.image || "/images/optimized/hero.jpg";
  const image = typeof rawImage === "string" ? rawImage : rawImage?.url || rawImage?.src || "/images/optimized/hero.jpg";
  const price = listing.price;
  const amount = typeof price === "object" ? price.perPerson ?? price.hourly ?? price.daily ?? price.amount : price;
  const location = [place.city, place.state].filter(Boolean).join(", ") || info.location || listing.location || "Explore nearby";
  const title = info.activityTitle || info.equipmentName || info.placeName || listing.title || "Adventure experience";
  const rating = listing.reviewSummary?.overallRating ?? listing.rating;
  const count = listing.reviewSummary?.count ?? listing.reviewCount ?? 0;
  const bookingCount = Number(listing.bookingCount ?? 0);
  return { image, amount, location, title, rating, count, bookingCount, id: listing._id ?? listing.id };
}

export default function PopularAdventures() {
  const dispatch = useDispatch();
  const router = useRouter();
  const listings = useSelector(selectActivities);
  const popularListings = listings.filter(isOfferedActivity);
  const status = useSelector(selectActivitiesStatus);
  const search = useSelector(selectLandingSearch);
  const [area, setArea] = useState("near");
  const cityLabel = area === "las-vegas" ? "Las Vegas" : search.location;

  useEffect(() => {
    dispatch(fetchBrowseListings({
      page: 1,
      limit: 50,
      category: "activity",
      city: area === "las-vegas" ? "Las Vegas" : undefined,
      location: area === "near" ? search.location || undefined : undefined,
      from: search.from || undefined,
      until: search.until || undefined,
      sort: "popular",
    }));
  }, [dispatch, area, search.location, search.from, search.until]);

  return (
    <section className="popular-listings-section" aria-labelledby="popular-heading">
      <div className="popular-listings-head">
        <div>
          <h2 id="popular-heading">{area === "near" ? "Popular adventures near you" : "Popular adventures in Las Vegas"}</h2>
          <p>{cityLabel ? `Discover experiences people are booking around ${cityLabel}.` : "Discover experiences people are booking near you."}</p>
        </div>
        <div className="popular-listings-actions">
          <div className="popular-area-tabs" aria-label="Adventure location">
            <button type="button" aria-pressed={area === "near"} className={area === "near" ? "active" : ""} onClick={() => setArea("near")}>Near</button>
            <button type="button" aria-pressed={area === "las-vegas"} className={area === "las-vegas" ? "active" : ""} onClick={() => setArea("las-vegas")}>Las Vegas <span aria-hidden="true"><ChevronDownIcon size={16} /></span></button>
          </div>
          <a href="/user-dashboard/explore">See all adventures <ChevronRightIcon size={15} /></a>
        </div>
      </div>

      {status === "loading" ? (
        <div className="popular-listings-grid">{[0, 1, 2, 3].map((item) => <div className="popular-listing-skeleton" key={item} />)}</div>
      ) : popularListings.length ? (
        <div className="popular-listings-grid">
          {popularListings.slice(0, 4).map((raw) => {
            const item = listingInfo(raw);
            const openListing = () => item.id && navigateToListingOrLogin(router, item.id);
            return (
              <article className="popular-listing-card" role="button" tabIndex={0} key={item.id || item.title} onClick={openListing} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openListing(); } }}>
                <img src={item.image} alt={item.title} />
                <div className="popular-listing-meta"><span>{item.location}</span><span><StarFilledIcon size={12} /> {item.rating ? Number(item.rating).toFixed(1) : "New"} ({item.count})</span></div>
                <h3>{item.title}</h3>
                <div className="popular-listing-price"><span>From <b>{item.amount ? `$${item.amount}` : "View price"}</b> / person</span><i>{item.bookingCount ? `${item.bookingCount.toLocaleString()} booked` : "New"}</i></div>
              </article>
            );
          })}
        </div>
      ) : <p className="popular-listings-empty">New adventures are being added. Check back soon.</p>}
    </section>
  );
}
