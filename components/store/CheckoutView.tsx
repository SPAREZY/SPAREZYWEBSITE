"use client";

import { useState } from "react";
import type { CartItem, CheckoutData } from "@/lib/store-types";
import { carLabel, vinLabel } from "@/lib/store-types";
import { isValidPhone, isValidEmail } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries";

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
  const [country, setCountry] = useState("United Arab Emirates");
  const [city, setCity] = useState("");
  const [pref, setPref] = useState("WhatsApp");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [err, setErr] = useState<Record<string, string>>({});

  function submit() {
    if (hp) return; // bot caught by honeypot — silently drop
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Please enter your name.";
    if (!phone.trim()) e.phone = "Please enter your phone number.";
    else if (!isValidPhone(phone)) e.phone = "Enter a valid phone number, including the country code.";
    if (email.trim() && !isValidEmail(email)) e.email = "That email doesn't look right.";
    if (pref === "Email" && !email.trim()) e.email = "Add your email, or pick another contact method.";
    if (!country) e.country = "Please choose your country.";
    if (!city.trim()) e.city = "Please enter your city.";
    if (!address.trim()) e.address = "Please enter your delivery address.";
    setErr(e);
    if (Object.keys(e).length) return;

    onPlaceOrder({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      wa: (sameWa ? phone : wa).trim(),
      country,
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
            <label>Email</label>
            <input
              className={err.email ? "err" : ""}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
            {err.email && <div className="err-msg">{err.email}</div>}
          </div>
        </div>

        <div className="grid2">
          <div className="f">
            <label>Phone *</label>
            <input
              className={err.phone ? "err" : ""}
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 50 123 4567"
            />
            {err.phone && <div className="err-msg">{err.phone}</div>}
          </div>
          <div className="f">
            <label>WhatsApp</label>
            <input
              type="tel"
              inputMode="tel"
              value={sameWa ? phone : wa}
              disabled={sameWa}
              onChange={(e) => setWa(e.target.value)}
              placeholder="+971 50 123 4567"
            />
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
            <label>Country *</label>
            <select
              className={err.country ? "err" : ""}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            {err.country && <div className="err-msg">{err.country}</div>}
          </div>
          <div className="f">
            <label>City *</label>
            <input
              className={err.city ? "err" : ""}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
            />
            {err.city && <div className="err-msg">{err.city}</div>}
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
            className={err.address ? "err" : ""}
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Area / Street"
          />
          {err.address && <div className="err-msg">{err.address}</div>}
        </div>

        <div className="f">
          <label>Order notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            <span className="dot" />
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
