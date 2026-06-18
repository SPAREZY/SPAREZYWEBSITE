"use client";

import { useState } from "react";

const STEPS = [
  {
    t: "Tell us your car & parts",
    d: "Select your car brand, enter your VIN / chassis (or upload a VIN / chassis photo), then list the parts you need and the quantity.",
  },
  {
    t: "We send you the price",
    d: "We find the exact match for your car and send you the price — with genuine, OEM or aftermarket options.",
  },
  {
    t: "Confirm & we ship",
    d: "You only pay once you're happy with the quote. Then we ship worldwide, right to your door.",
  },
];

const FAQS = [
  {
    q: "Is it really free?",
    a: "Yes — using The Finder to request parts is completely free. You only ever pay for the parts you confirm.",
  },
  {
    q: "How fast will I hear back?",
    a: "We reply on WhatsApp as soon as we've sourced your part — usually the same day.",
  },
  {
    q: "Genuine, OEM or aftermarket?",
    a: "Your choice. Tell us your preference and we'll source it and tell you exactly which one you're getting — no surprises, no copies sold as originals.",
  },
  {
    q: "I don't have the part number — can you still help?",
    a: "Absolutely. Just enter your VIN / chassis (or upload a VIN / chassis photo) and describe the part. We match the exact one for your car.",
  },
  {
    q: "Where do you deliver?",
    a: "Worldwide. We're based in M7, Musaffah Industrial, Abu Dhabi, and ship across the UAE and internationally.",
  },
  {
    q: "How and when do I pay?",
    a: "Only after you confirm the quote. We share payment details once you're happy to go ahead.",
  },
  {
    q: "What if the part isn't right?",
    a: "Because we match by your VIN / chassis, mismatches are rare. If anything's off, message us and we'll make it right.",
  },
];

export default function HelpView() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="sheet">
      <h2>How It Works</h2>
      <ol className="steps">
        {STEPS.map((s, i) => (
          <li key={i} className="step">
            <span className="step-n">{i + 1}</span>
            <div>
              <div className="step-t">{s.t}</div>
              <div className="step-d">{s.d}</div>
            </div>
          </li>
        ))}
      </ol>

      <h2 style={{ marginTop: 40 }}>FAQ</h2>
      <div className="faq">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div className={`faq-item ${isOpen ? "open" : ""}`} key={i}>
              <button
                type="button"
                className="faq-q"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{f.q}</span>
                <span className="faq-ic">{isOpen ? "–" : "+"}</span>
              </button>
              {isOpen && <div className="faq-a">{f.a}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
