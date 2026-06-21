"use client";

import { useEffect, useState } from "react";
import { REVIEWS, relativeTime } from "@/lib/reviews";

const LIKED_KEY = "sparezy_review_likes_v1";

export default function Reviews() {
  // Website likes added on top of the Google seed counts, keyed by review id.
  const [extra, setExtra] = useState<Record<string, number>>({});
  // Reviews this device has already liked (so the heart stays filled and can't
  // be spammed). Persisted in localStorage.
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      setLiked(JSON.parse(localStorage.getItem(LIKED_KEY) || "{}"));
    } catch {
      /* ignore */
    }
    fetch("/api/reviews/likes")
      .then((r) => r.json())
      .then((d) => setExtra(d?.likes && typeof d.likes === "object" ? d.likes : {}))
      .catch(() => {});
  }, []);

  function like(id: string) {
    if (liked[id]) return;
    // Optimistic: bump the count and remember this device liked it.
    setExtra((e) => ({ ...e, [id]: (e[id] ?? 0) + 1 }));
    const nextLiked = { ...liked, [id]: true };
    setLiked(nextLiked);
    try {
      localStorage.setItem(LIKED_KEY, JSON.stringify(nextLiked));
    } catch {
      /* ignore */
    }
    fetch("/api/reviews/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    }).catch(() => {});
  }

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
        {REVIEWS.map((r) => {
          const count = r.likes + (extra[r.id] ?? 0);
          const isLiked = !!liked[r.id];
          return (
            <article className="review-card" key={r.id}>
              <div className="review-head">
                <span className="review-av-fallback" style={{ background: r.color }}>
                  {r.author.charAt(0).toUpperCase()}
                </span>
                <div className="review-meta">
                  <div className="review-name">{r.author}</div>
                  <div className="review-sub">{r.sub}</div>
                </div>
              </div>
              <div className="review-stars-row">
                <span className="review-stars" aria-label="5 out of 5">
                  ★★★★★
                </span>
                <span className="review-time">{relativeTime(r.date)}</span>
              </div>
              <p className="review-text">{r.text}</p>
              <button
                type="button"
                className={`review-like ${isLiked ? "liked" : ""}`}
                onClick={() => like(r.id)}
                aria-pressed={isLiked}
                aria-label={isLiked ? "You liked this review" : "Like this review"}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 21s-7.5-4.6-10-9.1C.4 8.9 1.8 5.5 5 5.5c2 0 3.2 1.2 4 2.4.8-1.2 2-2.4 4-2.4 3.2 0 4.6 3.4 3 6.4-2.5 4.5-10 9.1-10 9.1Z" />
                </svg>
                <span>{count}</span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
