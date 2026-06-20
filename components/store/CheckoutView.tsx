"use client";

import { useState, type FormEvent } from "react";
import type { CartItem, CheckoutData } from "@/lib/store-types";
import { carLabel, vinLabel } from "@/lib/store-types";
import { isValidUaePhone, isValidEmail } from "@/lib/utils";

// The store serves the UAE only — fixed country + the seven emirates.
const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
];

// Reduce any UAE number the customer types to its 9-digit subscriber form
// (drops +971 / 971 / leading 0), so we can prepend a single +971.
function uaeLocal(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("971")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  return d;
}

export default function CheckoutView({
  cart,
  submitting,
  onPlaceOrder,
  onReturnToCart,
}: {
  cart: CartItem[];
  submitting: boolean;
  onPlaceOrder: (data: CheckoutData) => void;
  onReturnToCart: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wa, setWa] = useState("");
  const [sameWa, setSameWa] = useState(false);
  const [emirate, setEmirate] = useState("");
  const [city, setCity] = useState("");
  const [pref, setPref] = useState("WhatsApp");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [err, setErr] = useState<Record<string, string>>({});

  // Address / notes grow with their content so, when empty, they sit on a
  // single line flush with the other fields (no big gap to the underline).
  function autoGrow(e: FormEvent<HTMLTextAreaElement>) {
    const t = e.currentTarget;
    t.style.height = "auto";
    t.style.height = `${t.scrollHeight}px`;
  }

  function submit() {
    if (hp) return; // bot caught by honeypot — silently drop
    const local = uaeLocal(phone);
    const waLocal = uaeLocal(sameWa ? phone : wa);
    const fullPhone = local ? `+971 ${local}` : "";
    const fullWa = waLocal ? `+971 ${waLocal}` : "";

    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Please enter your name.";
    if (!emirate) e.emirate = "Please select your emirate.";
    if (!city.trim()) e.city = "Please enter your city / area.";
    if (!local) e.phone = "Please enter your phone number.";
    else if (!isValidUaePhone(`+971${local}`))
      e.phone = "Enter a valid UAE mobile number (e.g. 50 123 4567).";
    if (!email.trim()) e.email = "Please enter your email.";
    else if (!isValidEmail(email)) e.email = "That email doesn't look right.";
    if (!address.trim()) e.address = "Please enter your delivery address.";
    setErr(e);
    if (Object.keys(e).length) return;

    onPlaceOrder({
      name: name.trim(),
      email: email.trim(),
      phone: fullPhone,
      wa: fullWa,
      country: "United Arab Emirates",
      state: emirate,
      city: city.trim(),
      pref,
      address: address.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <div className="checkout-wrap">
      <div className="checkout-form">
        <div className="crumb-row">CART › INFORMATION › CONFIRMATION</div>
        <h2 className="co-h">Contact &amp; Delivery</h2>

        <div className="grid2">
          <div className="f">
            <label>Full name *</label>
            <input className={err.name ? "err" : ""} value={name} onChange={(e) => setName(e.target.value)} />
            {err.name && <div className="err-msg">{err.name}</div>}
          </div>
          <div className="f">
            <label>Email *</label>
            <input
              className={err.email ? "err" : ""}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {err.email && <div className="err-msg">{err.email}</div>}
          </div>
        </div>

        <div className="grid2">
          <div className="f">
            <label>Emirate *</label>
            <select
              className={err.emirate ? "err" : ""}
              value={emirate}
              onChange={(e) => setEmirate(e.target.value)}
            >
              <option value="">Select emirate</option>
              {EMIRATES.map((em) => (
                <option key={em} value={em}>
                  {em}
                </option>
              ))}
            </select>
            {err.emirate && <div className="err-msg">{err.emirate}</div>}
          </div>
          <div className="f">
            <label>City / Area *</label>
            <input
              className={err.city ? "err" : ""}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Musaffah, Deira"
            />
            {err.city && <div className="err-msg">{err.city}</div>}
          </div>
        </div>

        <div className="grid2">
          <div className="f">
            <label>Phone *</label>
            <div className={`phone-field ${err.phone ? "err" : ""}`}>
              <span className="phone-dial">+971</span>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-label="Phone number"
              />
            </div>
            {err.phone && <div className="err-msg">{err.phone}</div>}
          </div>
          <div className="f">
            <label>WhatsApp</label>
            <div className="phone-field">
              <span className="phone-dial">+971</span>
              <input
                type="tel"
                inputMode="tel"
                value={sameWa ? phone : wa}
                disabled={sameWa}
                onChange={(e) => setWa(e.target.value)}
                aria-label="WhatsApp number"
              />
            </div>
            <label className="inline-check">
              <input
                type="checkbox"
                checked={sameWa}
                onChange={(e) => setSameWa(e.target.checked)}
              />{" "}
              Same as phone
            </label>
          </div>
        </div>

        <div className="grid2">
          <div className="f">
            <label>Preferred contact</label>
            <select value={pref} onChange={(e) => setPref(e.target.value)}>
              <option>WhatsApp</option>
              <option>Phone call</option>
              <option>Email</option>
            </select>
          </div>
          <div className="f" />
        </div>

        <div className="f">
          <label>Delivery address *</label>
          <textarea
            className={`autogrow ${err.address ? "err" : ""}`}
            rows={1}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onInput={autoGrow}
            placeholder="Area / Street / Building"
          />
          {err.address && <div className="err-msg">{err.address}</div>}
        </div>

        <div className="f">
          <label>Order notes</label>
          <textarea
            className="autogrow"
            rows={1}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onInput={autoGrow}
            placeholder="Anything else we should know?"
          />
        </div>

        {/* honeypot — hidden from humans, catches bots */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
          aria-hidden="true"
        />

        <div className="co-actions">
          <button className="link-back" onClick={onReturnToCart}>
            ‹ Return to cart
          </button>
          <button className="rowbtn co-submit" onClick={submit} disabled={submitting}>
            <span>{submitting ? "Placing…" : "Place Order"}</span>
          </button>
        </div>
      </div>

      <aside className="checkout-summary">
        <div>
          {cart.map((it, i) => (
            <div className="vrow" style={{ padding: "14px 0" }} key={i}>
              <div className="vh">
                <span className="vt" style={{ fontSize: ".9rem" }}>
                  Vehicle {i + 1}
                </span>
                <span className="vin">{vinLabel(it)}</span>
              </div>
              <div className="car">
                {it.parts.length} part{it.parts.length > 1 ? "s" : ""}
                {carLabel(it) ? " · " + carLabel(it) : ""}
              </div>
            </div>
          ))}
        </div>
        <div className="cs-line">
          <span>
            Subtotal · {cart.length} vehicle{cart.length === 1 ? "" : "s"}
          </span>
          <span>
            <s>AED 287</s>
          </span>
        </div>
        <div className="cs-total">
          <span>Total</span>
          <span>AED 0.00</span>
        </div>
      </aside>
    </div>
  );
}
