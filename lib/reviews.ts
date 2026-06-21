// Single source of truth for the storefront's Google reviews. Shared by the
// public Reviews component, the likes API, and the admin dashboard so the IDs
// always line up.

export type ReviewSeed = {
  id: string;
  author: string;
  sub: string; // e.g. "10 reviews" or "Local Guide · 161 reviews"
  color: string; // avatar background
  date: string; // ISO date the review was posted (drives the "X months ago" label)
  likes: number; // likes the review already had on Google (seed for the counter)
  text: string;
};

export const REVIEWS: ReviewSeed[] = [
  {
    id: "ankith-issac",
    author: "Ankith Issac",
    sub: "10 reviews",
    color: "#7986cb",
    date: "2025-08-20",
    likes: 6,
    text: "The staff was really helpful and made sure I got the exact part I needed. What I liked most was that the pricing was very reasonable compared to other places I checked. Super smooth experience overall, I'll definitely come back here again.",
  },
  {
    id: "ricky-moras",
    author: "Ricky Moras",
    sub: "1 review",
    color: "#26a69a",
    date: "2025-09-21",
    likes: 4,
    text: "If you're in Mussafah and looking for spare parts, this is the place you can count on. They're well-stocked with every item you could possibly need, and the setup is organized and professional. Excellent customer service too—definitely worth checking out.",
  },
  {
    id: "rakesh-mahesh",
    author: "Rakesh Mahesh",
    sub: "Local Guide · 161 reviews",
    color: "#8e24aa",
    date: "2025-09-21",
    likes: 3,
    text: "Definitely one of the best parts store in town. Friendly vibe and great service. They have access to pretty much any part you might possibly need, even if they dont have it in stock they arrange it for you within minutes. Highly recommended!",
  },
  {
    id: "shankar-nettem",
    author: "shankar nettem",
    sub: "1 review",
    color: "#c0762e",
    date: "2025-09-21",
    likes: 6,
    text: "This shop is under management of young entrepreneurs, great service, affordable prices for quality spare parts",
  },
  {
    id: "muhammed-bin-rosh",
    author: "muhammed bin rosh",
    sub: "7 reviews",
    color: "#3a6ea5",
    date: "2025-08-20",
    likes: 5,
    text: "Very well impressed with their customer service and quality of products and their behavior towards customer is really good recommended to everyone who is in need of spare parts",
  },
  {
    id: "tech-ster",
    author: "Tech Ster",
    sub: "4 reviews",
    color: "#5c6bc0",
    date: "2025-09-21",
    likes: 3,
    text: "incredible customer service, they went above and beyond to help me find what i needed",
  },
  {
    id: "arsh-shiraz",
    author: "Arsh Shiraz",
    sub: "2 reviews",
    color: "#8e24aa",
    date: "2025-08-20",
    likes: 5,
    text: "sooo good",
  },
];

export const REVIEW_IDS: string[] = REVIEWS.map((r) => r.id);
export const REVIEW_LIKES_KEY = "review_likes";

// "X months/years ago" label, computed at render so it never freezes.
export function relativeTime(iso: string): string {
  const months = Math.max(
    1,
    Math.round((Date.now() - new Date(iso).getTime()) / (30 * 24 * 3600 * 1000)),
  );
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}
