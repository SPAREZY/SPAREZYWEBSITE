"use client";

import { useEffect, useState } from "react";

// Animated example placeholder that scrolls through suggestions (e.g. car
// brands) until the field has a value — like the Noon / Keeta search bar.
export default function RotatingPlaceholder({
  show,
  items,
  prefix = "",
  intervalMs = 2000,
}: {
  show: boolean;
  items: string[];
  prefix?: string;
  intervalMs?: number;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!show || items.length <= 1) return;
    const id = setInterval(() => setI((n) => (n + 1) % items.length), intervalMs);
    return () => clearInterval(id);
  }, [show, items.length, intervalMs]);

  if (!show || items.length === 0) return null;

  return (
    <span className="rot-ph" aria-hidden="true">
      <span key={i} className="rot-word">
        {prefix}
        {items[i]}
      </span>
    </span>
  );
}
