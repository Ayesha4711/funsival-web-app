import Link from "next/link";

export default function WhyFunsivalSection() {
  return <section className="why-funsival-section" aria-label="Why Funsival">
    <div className="why-funsival-artwork">
      <img src="/images/why-funsival-desktop.svg" alt="More fun. Less planning. Discover local adventures, trusted providers, and easy booking with Funsival." />
      <Link href="/user-dashboard/explore" className="why-funsival-explore-link"><span className="sr-only">Start Exploring</span></Link>
    </div>
    <div className="why-funsival-mobile">
      <Link className="why-funsival-mobile-art-link" href="/user-dashboard/explore" aria-label="Start exploring Funsival adventures">
        <img className="why-funsival-mobile-art" src="/images/why-funsival-mobile.svg" alt="Why Funsival: more fun, less planning, trusted local providers and easy booking." />
      </Link>
      <div className="why-funsival-mobile-copy">
        <span>Why Funsival?</span>
        <h2>More fun.<br />Less planning.</h2>
        <p>Funsival makes it easier to discover exciting local experiences, compare your options, and book everything in one place.</p>
        <Link href="/user-dashboard/explore">Start Exploring <b>›</b></Link>
      </div>
      <div className="why-funsival-mobile-cards">
        <article className="why-benefit-card dark"><small>DISCOVER</small><strong>1.2k+</strong><hr /><h3>Discover<br />Something New</h3><p>Find adventures you might never come across on your own.</p></article>
        <article className="why-benefit-card gold"><b className="why-benefit-icon">✓</b><h3>Trusted Local<br />Providers</h3><p>Book experiences offered by verified local businesses.</p></article>
        <article className="why-benefit-card cream"><b className="why-benefit-icon">✓</b><h3>Know before<br />you book</h3><p>See pricing, availability and important experience details upfront.</p></article>
        <article className="why-benefit-card teal"><small>CONFIRMED</small><strong>3 taps</strong><hr /><h3>Easy Booking</h3><p>Choose your adventure, reserve your spot and get ready to go.</p></article>
      </div>
    </div>
  </section>;
}
