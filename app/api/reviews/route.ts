import { NextResponse } from "next/server";

// Pulls reviews from the Google Places API (New) and caches them in memory so
// we don't call Google on every page view. Gated on two env vars — until they
// are set the endpoint simply reports "not configured" and the storefront hides
// the reviews section.
//
//   GOOGLE_PLACES_API_KEY  — a Google Cloud key with "Places API (New)" enabled
//   GOOGLE_PLACE_ID        — the Place ID of the Sparezy business listing
//
// Google returns up to 5 reviews per place.

export const dynamic = "force-dynamic";

type Review = {
  author: string;
  rating: number;
  text: string;
  time: string;
  photo: string;
  uri: string;
};
type Payload = {
  configured: boolean;
  rating: number | null;
  total: number | null;
  reviews: Review[];
};

const TTL_MS = 60 * 60 * 1000; // refresh at most once an hour
let cache: { at: number; data: Payload } | null = null;

export async function GET() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!key || !placeId) {
    return NextResponse.json({ configured: false, rating: null, total: null, reviews: [] });
  }
  if (cache && Date.now() - cache.at < TTL_MS) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "rating,userRatingCount,reviews",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) {
      return NextResponse.json({ configured: true, rating: null, total: null, reviews: [] });
    }
    const j = (await res.json()) as {
      rating?: number;
      userRatingCount?: number;
      reviews?: Array<{
        rating?: number;
        text?: { text?: string };
        originalText?: { text?: string };
        relativePublishTimeDescription?: string;
        authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
      }>;
    };
    const reviews: Review[] = (j.reviews ?? [])
      .map((r) => ({
        author: r.authorAttribution?.displayName ?? "Google user",
        rating: r.rating ?? 5,
        text: r.text?.text ?? r.originalText?.text ?? "",
        time: r.relativePublishTimeDescription ?? "",
        photo: r.authorAttribution?.photoUri ?? "",
        uri: r.authorAttribution?.uri ?? "",
      }))
      .filter((r) => r.text.trim().length > 0);

    const data: Payload = {
      configured: true,
      rating: j.rating ?? null,
      total: j.userRatingCount ?? null,
      reviews,
    };
    cache = { at: Date.now(), data };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ configured: true, rating: null, total: null, reviews: [] });
  }
}
