"use client";

import { useEffect, useState } from "react";

const GOOGLE_URL = "https://maps.app.goo.gl/LDPovtM4EmaZGwwA7?g_st=ic";

type Review = {
  author: string;
  rating: number;
  text: string;
  time: string;
  photo: string;
  uri: string;
};

// Relative "X months/years ago" label, computed at load so it never freezes.
function relativeTime(iso: string): string {
  const months = Math.max(
    1,
    Math.round((Date.now() - new Date(iso).getTime()) / (30 * 24 * 3600 * 1000)),
  );
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

// Real Google reviews shown by default. Live reviews from the Places API
// replace these automatically once GOOGLE_PLACES_API_KEY / GOOGLE_PLACE_ID
// are configured (and these stay as a graceful fallback if it returns none).
const FALLBACK_REVIEWS: Review[] = [
  {
    author: "Ankith Issac",
    rating: 5,
    text: "The staff was really helpful and made sure I got the exact part I needed. What I liked most was that the pricing was very reasonable compared to other places I checked. Super smooth experience overall, I'll definitely come back here again.",
    time: relativeTime("2025-08-20"),
    photo: "",
    uri: GOOGLE_URL,
  },
  {
    author: "Ricky Moras",
    rating: 5,
    text: "If you're in Mussafah and looking for spare parts, this is the place you can count on. They're well-stocked with every item you could possibly need, and the setup is organized and professional. Excellent customer service too—definitely worth checking out.",
    time: relativeTime("2025-09-21"),
    photo: "",
    uri: GOOGLE_URL,
  },
  {
    author: "Rakesh Mahesh",
    rating: 5,
    text: "Definitely one of the best parts store in town. Friendly vibe and great service. They have access to pretty much any part you might possibly need, even if they dont have it in stock they arrange it for you within minutes. Highly recommended!",
    time: relativeTime("2025-09-21"),
    photo: "",
    uri: GOOGLE_URL,
  },
  {
    author: "shankar nettem",
    rating: 5,
    text: "This shop is under management of young entrepreneurs, great service, affordable prices for quality spare parts",
    time: relativeTime("2025-09-21"),
    photo: "",
    uri: GOOGLE_URL,
  },
  {
    author: "muhammed bin rosh",
    rating: 5,
    text: "Very well impressed with their customer service and quality of products and their behavior towards customer is really good recommended to everyone who is in need of spare parts",
    time: relativeTime("2025-08-20"),
    photo: "",
    uri: GOOGLE_URL,
  },
  {
    author: "Tech Ster",
    rating: 5,
    text: "incredible customer service, they went above and beyond to help me find what i needed",
    time: relativeTime("2025-09-21"),
    photo: "",
    uri: GOOGLE_URL,
  },
  {
    author: "Arsh Shiraz",
    rating: 5,
    text: "sooo good",
    time: relativeTime("2025-08-20"),
    photo: "",
    uri: GOOGLE_URL,
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS);

  useEffect(() => {
    let alive = true;
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => {
        // Only swap in live Google reviews when there are some; otherwise keep
        // the curated fallback so the section is never empty.
        if (alive && Array.isArray(d.reviews) && d.reviews.length > 0) {
          setReviews(d.reviews);
        }
      })
      .catch(() => {
        /* keep the fallback reviews */
      });
    return () => {
      alive = false;
    };
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="reviews" aria-label="Customer reviews">
      <h3 className="reviews-h">
        <svg className="reviews-g" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
        </svg>
        What our customers say
      </h3>

      <div className="reviews-row">
        {reviews.map((r, i) => (
          <article className="review-card" key={i}>
            <div className="review-head">
              {r.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.photo} alt="" className="review-av" referrerPolicy="no-referrer" />
              ) : (
                <span className="review-av-fallback">{r.author.charAt(0).toUpperCase()}</span>
              )}
              <div className="review-meta">
                <div className="review-name">{r.author}</div>
                <div className="review-time">{r.time}</div>
              </div>
            </div>
            <div className="review-stars" aria-label={`${r.rating} out of 5`}>
              {"★★★★★".slice(0, Math.round(r.rating))}
              <span className="review-stars-dim">{"★★★★★".slice(Math.round(r.rating))}</span>
            </div>
            <p className="review-text">{r.text}</p>
          </article>
        ))}
      </div>

      <a className="reviews-more" href={GOOGLE_URL} target="_blank" rel="noopener noreferrer">
        See all reviews on Google ›
      </a>
    </section>
  );
}
