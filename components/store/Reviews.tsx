"use client";

// Real Google reviews, rendered as uniform cards so the type, sizing and
// layout are identical no matter how long each review is.
const REVIEWS = [
  {
    author: "Ankith Issac",
    sub: "10 reviews",
    color: "#7986cb",
    text: "The staff was really helpful and made sure I got the exact part I needed. What I liked most was that the pricing was very reasonable compared to other places I checked. Super smooth experience overall, I'll definitely come back here again.",
  },
  {
    author: "Ricky Moras",
    sub: "1 review",
    color: "#26a69a",
    text: "If you're in Mussafah and looking for spare parts, this is the place you can count on. They're well-stocked with every item you could possibly need, and the setup is organized and professional. Excellent customer service too—definitely worth checking out.",
  },
  {
    author: "Rakesh Mahesh",
    sub: "Local Guide · 161 reviews",
    color: "#8e24aa",
    text: "Definitely one of the best parts store in town. Friendly vibe and great service. They have access to pretty much any part you might possibly need, even if they dont have it in stock they arrange it for you within minutes. Highly recommended!",
  },
  {
    author: "shankar nettem",
    sub: "1 review",
    color: "#c0762e",
    text: "This shop is under management of young entrepreneurs, great service, affordable prices for quality spare parts",
  },
  {
    author: "muhammed bin rosh",
    sub: "7 reviews",
    color: "#3a6ea5",
    text: "Very well impressed with their customer service and quality of products and their behavior towards customer is really good recommended to everyone who is in need of spare parts",
  },
  {
    author: "Tech Ster",
    sub: "4 reviews",
    color: "#5c6bc0",
    text: "incredible customer service, they went above and beyond to help me find what i needed",
  },
  {
    author: "Arsh Shiraz",
    sub: "2 reviews",
    color: "#8e24aa",
    text: "sooo good",
  },
];

function GoogleG({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export default function Reviews() {
  return (
    <section className="reviews" aria-label="Customer reviews">
      <h3 className="reviews-h">
        <GoogleG className="reviews-g" />
        What our customers say
      </h3>

      <div className="reviews-row">
        {REVIEWS.map((r, i) => (
          <article className="review-card" key={i}>
            <div className="review-head">
              <span className="review-av-fallback" style={{ background: r.color }}>
                {r.author.charAt(0).toUpperCase()}
              </span>
              <div className="review-meta">
                <div className="review-name">{r.author}</div>
                <div className="review-sub">{r.sub}</div>
              </div>
              <GoogleG className="review-gicon" />
            </div>
            <div className="review-stars" aria-label="5 out of 5">
              ★★★★★
            </div>
            <p className="review-text">{r.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
