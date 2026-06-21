import { REVIEWS, relativeTime } from "@/lib/reviews";

// Google Maps listing for Sparezy — every review (and the heading) opens it.
const MAPS_URL = "https://maps.app.goo.gl/LDPovtM4EmaZGwwA7?g_st=ic";

export default function Reviews() {
  return (
    <section className="reviews" aria-label="Customer reviews">
      <a
        className="reviews-h"
        href={MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="See Sparezy on Google Maps"
      >
        <svg className="reviews-g" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
        </svg>
        What our customers say
      </a>

      <div className="reviews-row">
        {REVIEWS.map((r) => (
          <a
            className="review-card"
            key={r.id}
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
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
            <div className="review-like" aria-label={`${r.likes} likes`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{r.likes}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
