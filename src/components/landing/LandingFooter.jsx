"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/logo.svg";
const footerLinks = [
  { heading: "Explore", links: ["Activities", "Destinations", "How it works"] },
  { heading: "Funsival", links: ["About", "Become a Provider", "Contact"] },
  { heading: "Support", links: ["Help Center", "Cancellation Policy", "Terms", "Privacy"] },
  { heading: "Community", links: ["Forum", "Events", "Groups"] },
  { heading: "Adventure Guides", links: ["Best Things to do", "Weekend Getaways", "Local Food Tours"] },
  { heading: "Resources", links: ["Travel Tips", "Packing List", "Safety Guides"] },
  { heading: "Provider Program", links: ["Provider Benefits", "Listing Guidelines", "Provider Portal"] },
];

export default function AppFooter() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
  };

  return (
    <footer className="landing-footer w-full">
      <div className="landing-footer-top">
        <div className="landing-footer-links">
          {footerLinks.map(({ heading, links }) => <div className="landing-footer-column" key={heading}>
            <h4>{heading}</h4>
            <ul>{links.map((label) => <li key={label}><Link href={label === "How it works" ? "#how-it-works" : label === "Become a Provider" ? "/signup/host" : "#"}>{label}</Link></li>)}</ul>
          </div>)}
        </div>
        <div className="landing-footer-newsletter">
          <h3>Get weekend ideas<br />in your inbox</h3>
          <p>New adventures, local deals and trip ideas. One email a week.</p>
          <form onSubmit={handleSubscribe}>
            <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="landing-footer-brand">
        <Image src={logo} alt="Funsival" width={1200} height={220} />
      </div>
      <div className="landing-footer-bottom">
        <span>© 2026 Funsival. All rights reserved.</span>
        <nav aria-label="Legal links"><Link href="#">Terms</Link><Link href="#">Privacy</Link><Link href="#">Cookies</Link></nav>
      </div>
    </footer>
  );
}
