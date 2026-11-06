"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";
import { fetchBrowseDestinations, selectBrowseDestinations, selectActivities } from "@/store/slices/activitiesSlice";
import { getDestinationPhoto } from "@/lib/destinationImages";
import axiosInstance from "@/store/axiosInstance";

export default function LandingStorySections() {
  const dispatch = useDispatch();
  const destinations = useSelector(selectBrowseDestinations);
  const [destinationOffset, setDestinationOffset] = useState(0);

  useEffect(() => {
    dispatch(fetchBrowseDestinations({ limit: 20 }));
  }, [dispatch]);

  const source = destinations;
  const destinationCards = source.length
    ? Array.from({ length: Math.min(4, source.length) }, (_, index) => source[(destinationOffset + index) % source.length])
    : [];

  return (
    <>
      <section className="how-it-works-section" id="how-it-works" aria-label="Your next adventure is only a few clicks away">
        <img className="how-it-works-desktop-art" src="/images/how-it-works-desktop.svg" alt="Your next adventure is only a few clicks away: discover, book, and have fun." />
        <div className="how-it-works-mobile">
          <img className="how-it-works-mobile-art" src="/images/how-it-works-mobile.svg" alt="Discover an adventure, book your spot, and have fun." />
          <h2>Your next adventure is only a few clicks away.</h2>
          <article className="how-mobile-card">
            <img src="/images/optimized/hawaii.webp" alt="Mountain adventure destination" />
            <small>① &nbsp;Step One</small><h3>Discover</h3><p>Browse activities, destinations and experiences that match what you’re looking for.</p>
          </article>
          <span className="how-mobile-arrow" aria-hidden="true">↓</span>
          <article className="how-mobile-card">
            <div className="how-mobile-booking"><b>Jet Ski Adventure</b><span>Sat, Oct 17</span><div><i>9:00</i><i className="selected">11:00</i><i>1:30</i><i>4:00</i></div><p>2 riders x $89 <strong>$178</strong></p><button type="button">Reserve Spot</button></div>
            <small>② &nbsp;Step two</small><h3>Book</h3><p>Choose your date, review the details and reserve your adventure.</p>
          </article>
          <span className="how-mobile-arrow" aria-hidden="true">↓</span>
          <article className="how-mobile-card">
            <img src="/images/optimized/hero.webp" alt="Guests enjoying an adventure" />
            <small>③ &nbsp;Step three</small><h3>Have Fun</h3><p>Show up, check in with your provider and enjoy the experience.</p>
          </article>
        </div>
      </section>

      <section className="destination-showcase" aria-labelledby="destination-showcase-title">
        <div className="destination-showcase-heading">
          <div><h2 id="destination-showcase-title">Explore somewhere new</h2><p>Find unforgettable things to do in popular destinations.</p></div>
          <div className="destination-showcase-controls">
            <button type="button" aria-label="Previous destinations" onClick={() => setDestinationOffset((value) => (value - 1 + source.length) % source.length)}><ChevronLeftIcon size={18} /></button>
            <button type="button" aria-label="Next destinations" onClick={() => setDestinationOffset((value) => (value + 1) % source.length)}><ChevronRightIcon size={18} /></button>
          </div>
        </div>
        <div className="destination-showcase-cards">
          {destinationCards.map((destination, index) => {
            const city = destination.city || "Explore";
            return <Link className="destination-showcase-card" href={`/destinations/${encodeURIComponent(city)}`} key={`${city}-${destination.country || ""}-${index}`}>
              <img src={getDestinationPhoto(destination)} alt="" aria-hidden="true" />
              <span>{destination.listings ?? destination.count ?? destination.listingCount ?? 0} Adventures</span>
              <div><strong>{city}</strong><small>Explore Adventures</small></div><b aria-hidden="true">↗</b>
            </Link>;
          })}
        </div>
      </section>

      <section className="landing-offer-section" aria-label="Get 10 percent off your first adventure">
        <img className="landing-offer-desktop-art" src="/images/first-adventure-offer-desktop.svg" alt="Your first adventure is 10% off with code FIRSTFUN." />
        <img className="landing-offer-mobile-art" src="/images/first-adventure-offer-mobile.svg" alt="Your first adventure is 10% off with code FIRSTFUN." />
        <Link className="landing-offer-signup" href="/signup/role-selection"><span className="sr-only">Sign Up and Get 10% off</span></Link>
        <Link className="landing-offer-explore" href="/user-dashboard/explore"><span className="sr-only">Explore Adventures</span></Link>
      </section>

      <LandingReviews />

      <section className="provider-invitation" id="provider" aria-label="Have an adventure to offer">
        <img className="provider-invitation-desktop-art" src="/images/provider-invitation-desktop.svg" alt="Have an adventure to offer? List activities, rentals, places or equipment, manage bookings, and get paid securely." />
        <img className="provider-invitation-mobile-art" src="/images/provider-invitation-mobile.svg" alt="Have an adventure to offer? List activities, rentals, places or equipment, manage bookings, and get paid securely." />
        <Link className="provider-become-link" href="/signup/host"><span className="sr-only">Become a provider</span></Link>
        <Link className="provider-learn-link" href="#how-it-works" onClick={(event) => {
          event.preventDefault();
          document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}><span className="sr-only">Learn how it works</span></Link>
      </section>

    </>
  );
}

function LandingReviews() {
  const listings = useSelector(selectActivities);
  const [reviews, setReviews] = useState([]);
  const listingIds = listings.slice(0, 4).map((listing) => listing._id || listing.id).filter(Boolean);
  const requestKey = listingIds.join(",");

  useEffect(() => {
    const ids = requestKey.split(",").filter(Boolean);
    if (!ids.length) {
      setReviews([]);
      return undefined;
    }
    let cancelled = false;
    Promise.all(ids.map(async (listingId) => {
      try {
        const response = await axiosInstance.get(`/reviews/listings/${listingId}?page=1&limit=1`);
        const payload = response.data?.data ?? response.data;
        const items = payload?.reviews ?? payload?.items ?? payload?.listingReviews ?? [];
        return (Array.isArray(items) ? items : []).map((review) => ({ ...review, listingId }));
      } catch {
        return [];
      }
    })).then((groups) => {
      if (!cancelled) setReviews(groups.flat().filter((review) => review.comment || review.reviewText || review.message).slice(0, 4));
    });
    return () => { cancelled = true; };
  // requestKey represents the listing ids and prevents fetching on unrelated listing object updates.
  }, [requestKey]);

  return <section className="landing-reviews-section">
        <div className="landing-reviews-heading"><h2>Adventures worth talking about.</h2><p>See why people use Funsival to discover their next experience.</p></div>
        {reviews.length ? <div className="landing-reviews-track">{reviews.map((review, index) => {
          const user = review.user ?? review.reviewer ?? review.author ?? {};
          const name = user.name || [user.firstName, user.lastName].filter(Boolean).join(" ") || "Funsival guest";
          const city = [user.city, user.state].filter(Boolean).join(", ");
          const rating = Number(review.overallRating ?? review.rating ?? 5);
          const comment = review.comment || review.reviewText || review.message;
          return <article className="landing-review-card" key={review._id || review.id || `${review.listingId}-${index}`}><div className="review-stars" aria-label={`${rating} out of 5 stars`}>{"★".repeat(Math.max(0, Math.min(5, Math.round(rating))))}</div><p>“{comment}”</p><div className="review-author"><span>{name.slice(0, 1)}</span><div><b>{name}</b><small>{city || "Verified guest"}</small></div></div></article>;
        })}</div> : <p className="landing-reviews-empty">Guest reviews will appear here after the first adventures are reviewed.</p>}
      </section>;
}

export function ReadyAdventureBanner() {
  return <section className="ready-adventure-banner">
    <img className="ready-adventure-desktop-art" src="/images/ready-adventure-desktop.svg" alt="Ready for your next adventure? Discover something new and book an experience you’ll remember." />
    <img className="ready-adventure-mobile-art" src="/images/ready-adventure-mobile.svg" alt="Ready for your next adventure? Discover something new and book an experience you’ll remember." />
    <Link href="/user-dashboard/explore"><span className="sr-only">Explore Adventures</span></Link>
  </section>;
}
