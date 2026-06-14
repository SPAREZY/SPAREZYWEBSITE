"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isValidVin } from "@/lib/utils";
import type { CartItem, CartPart, CheckoutData, OrderRecap } from "@/lib/store-types";
import { carLabel } from "@/lib/store-types";
import BackgroundGrid from "./BackgroundGrid";
import WhatsAppFab from "./WhatsAppFab";
import CheckoutView from "./CheckoutView";
import ConfirmView from "./ConfirmView";
import ContactView from "./ContactView";

type View = "home" | "checkout" | "confirm" | "contact";
const STORAGE_KEY = "sparezy_cart_v1";
const BUSINESS_WA = "971522250600";
const PREF_MAP: Record<string, "whatsapp" | "call" | "email"> = {
  WhatsApp: "whatsapp",
  "Phone call": "call",
  Email: "email",
};

export default function StoreApp() {
  const [view, setView] = useState<View>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [addBar, setAddBar] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [recap, setRecap] = useState<OrderRecap | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // product form
  const [vin, setVin] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [parts, setParts] = useState<CartPart[]>([{ name: "", qty: 1 }]);
  const [vinErr, setVinErr] = useState(false);
  const [partsErr, setPartsErr] = useState(false);

  const addBarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load + persist cart
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCart(JSON.parse(saved));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const toggleCart = useCallback(() => setCartOpen((o) => !o), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCartOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function go(v: View) {
    if (v === "checkout" && cart.length === 0) {
      openCart();
      return;
    }
    setView(v);
  }

  function showToast(t: string) {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }
  function showAddBar() {
    setAddBar(true);
    if (addBarTimer.current) clearTimeout(addBarTimer.current);
    addBarTimer.current = setTimeout(() => setAddBar(false), 2200);
  }

  function resetForm() {
    setEditIndex(null);
    setVin("");
    setMake("");
    setModel("");
    setYear("");
    setParts([{ name: "", qty: 1 }]);
    setVinErr(false);
    setPartsErr(false);
  }

  function updatePart(i: number, patch: Partial<CartPart>) {
    setParts((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function addPartRow() {
    setParts((prev) => [...prev, { name: "", qty: 1 }]);
  }
  function removePartRow(i: number) {
    setParts((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  function saveItem(direct: boolean) {
    const vinNorm = vin.replace(/\s/g, "").toUpperCase();
    const cleanParts = parts
      .map((p) => ({ name: p.name.trim(), qty: Math.max(1, Number(p.qty) || 1) }))
      .filter((p) => p.name);
    const badVin = !isValidVin(vinNorm);
    const badParts = cleanParts.length === 0;
    setVinErr(badVin);
    setPartsErr(badParts);
    if (badVin || badParts) return;

    const item: CartItem = { vin: vinNorm, make, model, year, parts: cleanParts };
    setCart((prev) => {
      if (editIndex !== null) {
        const copy = [...prev];
        copy[editIndex] = item;
        return copy;
      }
      return [...prev, item];
    });
    const wasEditing = editIndex !== null;
    resetForm();
    if (wasEditing) showToast("Updated");
    if (direct) setView("checkout");
    else if (!wasEditing) showAddBar();
  }

  function editItem(i: number) {
    const it = cart[i];
    setEditIndex(i);
    setVin(it.vin);
    setMake(it.make);
    setModel(it.model);
    setYear(it.year);
    setParts(it.parts.length ? it.parts.map((p) => ({ ...p })) : [{ name: "", qty: 1 }]);
    setVinErr(false);
    setPartsErr(false);
    closeCart();
    setView("home");
  }
  function cancelEdit() {
    resetForm();
    closeCart();
  }
  function removeItem(i: number) {
    setCart((prev) => prev.filter((_, idx) => idx !== i));
    showToast("Removed");
  }
  function changeQty(i: number, j: number, delta: number) {
    setCart((prev) => {
      const copy = prev.map((it, idx) =>
        idx === i ? { ...it, parts: it.parts.map((p) => ({ ...p })) } : it,
      );
      const part = copy[i].parts[j];
      part.qty += delta;
      if (part.qty < 1) {
        copy[i].parts.splice(j, 1);
        if (copy[i].parts.length === 0) {
          copy.splice(i, 1);
        }
      }
      return copy;
    });
  }

  async function placeOrder(data: CheckoutData) {
    const contactPref = PREF_MAP[data.pref] ?? "whatsapp";
    setSubmitting(true);
    try {
      const humanIds: string[] = [];
      for (const it of cart) {
        const res = await fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vin: it.vin,
            make: it.make || undefined,
            model: it.model || undefined,
            year: it.year ? Number(it.year) : undefined,
            customerName: data.name,
            phone: data.phone || undefined,
            email: data.email || undefined,
            city: data.city,
            country: data.country,
            address: data.address,
            contactPref,
            partPreference: "any",
            partsJson: it.parts.map((p) => ({ name: p.name, qty: p.qty, condition: "any" })),
            customerNote: data.notes || undefined,
          }),
        });
        const body = await res.json();
        if (!res.ok) {
          showToast(body?.error || "Could not place the order. Try again.");
          setSubmitting(false);
          return;
        }
        humanIds.push(body.humanId);
      }

      const snapshot = JSON.parse(JSON.stringify(cart)) as CartItem[];
      const waLink = buildOrderWaLink(humanIds, snapshot, data);
      setRecap({
        humanIds,
        vehicles: snapshot,
        name: data.name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        country: data.country,
        address: data.address,
        notes: data.notes,
        waLink,
      });
      setCart([]);
      setView("confirm");
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const editing = editIndex !== null;

  return (
    <div className="store">
      <BackgroundGrid />

      <div className="app">
        <header>
          <div className="nav">
            <div className="nav-l">
              <button className="lnk" onClick={() => go("contact")}>
                Contact
              </button>
            </div>
            <button className="cartlink" onClick={toggleCart}>
              Cart ( {cart.length} )
            </button>
          </div>
        </header>

        <div className="stage">
          {/* PRODUCT */}
          <div className={`view ${view === "home" ? "active" : ""}`}>
            <div className="pdp">
              <div>
                <div className="imgpanel">
                  <div className="mbox-wrap" />
                </div>
                <div className="mbox-cap" style={{ textAlign: "center", marginTop: 14 }}>
                  ANY PART · ANY CAR · WE HAVE IT
                </div>
              </div>

              <div className="info">
                <h1 className="ptitle">A Finder</h1>
                <div className="ptag-line">ANY PART · ANY CAR · WE GOT IT</div>
                <div className="price">
                  <s className="was">AED 0.00</s> <b className="free-tag">FREE</b>
                </div>
                <div className="desc">
                  <p>
                    <strong>What you get:</strong> every part you need for one car, sourced and
                    delivered. Works for any make, model, or year. Common or hard-to-find. Add your
                    VIN/chassis, list your parts.
                  </p>
                  <p>Parts for another car? Just add it to your cart.</p>
                </div>

                <div className="f">
                  <label>Chassis / VIN number *</label>
                  <input
                    className={`vin-input ${vinErr ? "err" : ""}`}
                    maxLength={17}
                    value={vin}
                    onChange={(e) => setVin(e.target.value.toUpperCase())}
                    placeholder="JTEBU14R78K123456"
                  />
                  {vinErr && (
                    <div className="err-msg">
                      That doesn&apos;t look like a valid VIN — it must be 17 letters/numbers (I, O
                      and Q are never used).
                    </div>
                  )}
                  <div className="hint">
                    On your Mulkiya, the dashboard near the windshield, or the driver&apos;s door
                    frame.
                  </div>
                </div>

                <div className="grid3">
                  <div className="f">
                    <label>Make</label>
                    <input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Toyota, GMC, BYD" />
                  </div>
                  <div className="f">
                    <label>Model</label>
                    <input
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="Land Cruiser, Altima, S-Class"
                    />
                  </div>
                  <div className="f">
                    <label>Year</label>
                    <input
                      value={year}
                      maxLength={4}
                      onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="2018, 1998, 2026"
                    />
                  </div>
                </div>

                <div className="f">
                  <label>Parts needed for this car *</label>
                </div>
                <div>
                  {parts.map((p, i) => (
                    <div className="part-row" key={i}>
                      <input
                        className="p-name"
                        placeholder="Front brake pads, Engine oil, Headlights"
                        value={p.name}
                        onChange={(e) => updatePart(i, { name: e.target.value })}
                      />
                      <input
                        className="p-qty"
                        type="number"
                        min={1}
                        value={p.qty}
                        title="Qty"
                        onChange={(e) => updatePart(i, { qty: Math.max(1, Number(e.target.value) || 1) })}
                      />
                      <button className="del" title="Remove" onClick={() => removePartRow(i)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {partsErr && <div className="err-msg">Please describe at least one part.</div>}
                <button className="addpart" onClick={addPartRow}>
                  + Add another part
                </button>

                <button className="rowbtn" onClick={() => saveItem(false)}>
                  <span>{editing ? "Save Changes" : "Add to Cart"}</span>
                  <span className="dot" />
                </button>
                {!editing && (
                  <button className="rowbtn secondary" onClick={() => saveItem(true)}>
                    <span>Order Now — Straight to Checkout</span>
                    <span className="dot" />
                  </button>
                )}
                {editing && (
                  <button className="rowbtn secondary" onClick={cancelEdit}>
                    <span>Cancel Editing</span>
                    <span className="dot" />
                  </button>
                )}
                {editing && (
                  <div className="hint" style={{ marginTop: 12 }}>
                    Editing vehicle {editIndex! + 1} — save with the button above.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CHECKOUT */}
          <div className={`view ${view === "checkout" ? "active" : ""}`}>
            <CheckoutView
              cart={cart}
              submitting={submitting}
              onPlaceOrder={placeOrder}
              onReturnToCart={() => {
                setView("home");
                openCart();
              }}
            />
          </div>

          {/* CONFIRM */}
          <div className={`view ${view === "confirm" ? "active" : ""}`}>
            <ConfirmView recap={recap} onBack={() => go("home")} />
          </div>

          {/* CONTACT */}
          <div className={`view ${view === "contact" ? "active" : ""}`}>
            <ContactView />
          </div>
        </div>
      </div>

      {/* CART DRAWER */}
      <div className={`cart-overlay ${cartOpen ? "open" : ""}`} onClick={closeCart} />
      <aside className={`cart-drawer ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen}>
        <div className="drawer-head">
          <button className="drawer-x" onClick={closeCart}>
            Close
          </button>
          <button className="drawer-title" onClick={closeCart}>
            Cart ( {cart.length} )
          </button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="drawer-empty">YOUR CART IS EMPTY</div>
          ) : (
            cart.map((it, i) => (
              <div className="vrow" key={i}>
                <div className="vh">
                  <span className="vt">VEHICLE {i + 1} — WE HAVE IT</span>
                  <span className="vin">{it.vin}</span>
                </div>
                {carLabel(it) && <div className="car">{carLabel(it).toUpperCase()}</div>}
                <ul>
                  {it.parts.map((p, j) => (
                    <li key={j}>
                      <span className="pn">{p.name.toUpperCase()}</span>
                      <span className="stepper">
                        <button onClick={() => changeQty(i, j, -1)} aria-label="Decrease">
                          −
                        </button>
                        <span className="qv">{p.qty}</span>
                        <button onClick={() => changeQty(i, j, 1)} aria-label="Increase">
                          +
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="vlinks">
                  <button onClick={() => editItem(i)}>EDIT</button>
                  <button onClick={() => removeItem(i)}>REMOVE</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="drawer-subtotal">
              <span>Subtotal</span>
              <span className="sub-price">
                <s>AED 0.00</s> <b className="free">FREE</b>
              </span>
            </div>
            <div className="drawer-note">
              {cart.length} {cart.length === 1 ? "VEHICLE" : "VEHICLES"} · PAY ONLY WHEN YOUR PARTS
              ARE CONFIRMED
            </div>
            <button
              className="rowbtn"
              onClick={() => {
                closeCart();
                go("checkout");
              }}
            >
              <span>Checkout</span>
              <span className="dot" />
            </button>
            <button
              className="rowbtn secondary"
              onClick={() => {
                resetForm();
                setView("home");
                closeCart();
              }}
            >
              <span>Add Another Vehicle</span>
              <span className="dot" />
            </button>
          </div>
        )}
      </aside>

      <div className={`addbar ${addBar ? "show" : ""}`}>PRODUCT ADDED TO CART</div>
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>

      <WhatsAppFab />
    </div>
  );
}

function buildOrderWaLink(humanIds: string[], vehicles: CartItem[], data: CheckoutData): string {
  let msg = `NEW ORDER ${humanIds.join(", ")} — SPAREZY\n`;
  msg += `Name: ${data.name}\nPhone: ${data.phone}\n`;
  msg += `City: ${data.city}${data.country ? ", " + data.country : ""}\n`;
  msg += `Address: ${data.address}\n`;
  vehicles.forEach((it, i) => {
    const label = carLabel(it);
    msg += `\nVehicle ${i + 1}${humanIds[i] ? " (" + humanIds[i] + ")" : ""} — VIN: ${it.vin}${
      label ? " (" + label + ")" : ""
    }\n`;
    it.parts.forEach((p) => {
      msg += `• ${p.name} x${p.qty}\n`;
    });
  });
  if (data.notes) msg += `\nNote: ${data.notes}\n`;
  return `https://wa.me/${BUSINESS_WA}?text=${encodeURIComponent(msg)}`;
}
