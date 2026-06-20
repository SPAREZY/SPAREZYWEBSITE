"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CartItem, CheckoutData, OrderRecap } from "@/lib/store-types";
import { carLabel, vinLabel } from "@/lib/store-types";
import { rememberOrders } from "@/lib/tracked-orders";
import { trackAddToCart, trackInitiateCheckout, trackLead } from "@/lib/analytics";
import BackgroundGrid from "./BackgroundGrid";
import CheckoutView from "./CheckoutView";
import ConfirmView from "./ConfirmView";
import ContactView from "./ContactView";
import OrdersView from "./OrdersView";
import HelpView from "./HelpView";
import BrandPicker from "./BrandPicker";
import ModelPicker from "./ModelPicker";
import PartPicker from "./PartPicker";

type View = "home" | "checkout" | "confirm" | "contact" | "orders" | "help";

// Header category tiles. Only the first (the live part finder) works; the
// rest are "Soon" teasers. Icons live in /public/cat-icons.
const HEADER_CATS = [
  { key: "battery", label: "Buy Battery", img: "/cat-icons/battery.png", accent: "34 197 94" },
  { key: "part", label: "Buy Auto Parts", img: "/cat-icons/part.png", accent: "249 115 22", live: true },
  { key: "oil", label: "Buy Lubricant", img: "/cat-icons/oil.png", accent: "40 120 255" },
  { key: "body", label: "Buy Body Parts", img: "/cat-icons/body.png", accent: "239 68 68" },
];

// Resize + compress a chosen image to a small JPEG data URL so the
// registration card can be stored/sent without any blob storage.
async function fileToCompressedDataUrl(file: File, maxDim = 1280, quality = 0.68): Promise<string> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error("decode failed"));
    im.src = dataUrl;
  });
  let { width, height } = img;
  if (Math.max(width, height) > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}
type FormPart = { name: string };
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
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [parts, setParts] = useState<FormPart[]>([{ name: "" }]);
  const [makeErr, setMakeErr] = useState(false);
  const [modelErr, setModelErr] = useState(false);
  const [partsErr, setPartsErr] = useState(false);

  const addBarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const homeViewRef = useRef<HTMLDivElement>(null);
  const brandFieldRef = useRef<HTMLDivElement>(null);

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
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* storage quota (e.g. large card photos) — keep the cart in memory */
    }
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

  // ----- browser back/forward navigation -----
  // The store is a single-page app (one URL), so without this the browser back
  // button would leave the site. Mirror the current view + cart-drawer state
  // into the History API so back/forward step through in-app screens instead.
  // (We merge into the existing history.state to leave Next.js's router state
  // intact, and keep the same URL so no route change is triggered.)
  const skipHistoryPush = useRef(true);
  useEffect(() => {
    window.history.replaceState({ ...window.history.state, spView: "home", spCart: false }, "");
    const onPop = (e: PopStateEvent) => {
      const s = (e.state ?? {}) as { spView?: View; spCart?: boolean };
      skipHistoryPush.current = true;
      setView(s.spView ?? "home");
      setCartOpen(!!s.spCart);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  useEffect(() => {
    if (skipHistoryPush.current) {
      skipHistoryPush.current = false;
      return;
    }
    window.history.pushState({ ...window.history.state, spView: view, spCart: cartOpen }, "");
  }, [view, cartOpen]);

  // Fire a checkout-funnel event whenever the customer reaches the checkout view.
  useEffect(() => {
    if (view === "checkout") trackInitiateCheckout();
  }, [view]);

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
    setMake("");
    setModel("");
    setYear("");
    setParts([{ name: "" }]);
    setMakeErr(false);
    setModelErr(false);
    setPartsErr(false);
  }

  // Picking a brand sets the make and resets the model (models depend on the brand).
  function selectBrand(v: string) {
    setMake(v);
    setModel("");
    setModelErr(false);
    if (v) setMakeErr(false);
  }

  function updatePart(i: number, patch: Partial<FormPart>) {
    setParts((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function addPartRow() {
    setParts((prev) => [...prev, { name: "" }]);
  }
  function removePartRow(i: number) {
    setParts((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  function saveItem(direct: boolean) {
    const cleanParts = parts
      .map((p) => ({ name: p.name.trim(), qty: 1 }))
      .filter((p) => p.name);
    // The car is identified by brand + the parts requested.
    const badBrand = !make.trim();
    const badModel = !model.trim();
    const badParts = cleanParts.length === 0;
    setMakeErr(badBrand);
    setModelErr(badModel);
    setPartsErr(badParts);
    if (badBrand || badModel || badParts) {
      // Brand sits at the top, far from the buttons — guide the eye to it.
      if (badBrand) {
        brandFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    const item: CartItem = { vin: "", make, model, year, parts: cleanParts };
    setCart((prev) => {
      if (editIndex !== null) {
        const copy = [...prev];
        copy[editIndex] = item;
        return copy;
      }
      return [...prev, item];
    });
    const wasEditing = editIndex !== null;
    if (!wasEditing) trackAddToCart();
    resetForm();
    if (wasEditing) showToast("Updated");
    if (direct) openCart();
    else if (!wasEditing) showAddBar();
  }

  function editItem(i: number) {
    const it = cart[i];
    setEditIndex(i);
    setMake(it.make);
    setModel(it.model);
    setYear(it.year);
    setParts(
      it.parts.length ? it.parts.map((p) => ({ name: p.name })) : [{ name: "" }],
    );
    setMakeErr(false);
    setModelErr(false);
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
            state: data.state || undefined,
            country: data.country,
            address: data.address,
            contactPref,
            partPreference: "any",
            partsJson: it.parts.map((p) => ({ name: p.name, qty: p.qty, condition: "any" })),
            photoUrl: it.photo || undefined,
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
      // Remember these orders on this device so they appear on the Orders page.
      rememberOrders(humanIds, data.phone);
      // Conversion event for ad platforms (Google / Meta / TikTok).
      trackLead({ orderIds: humanIds, count: humanIds.length });
      setRecap({
        humanIds,
        vehicles: snapshot,
        name: data.name,
        phone: data.phone,
        email: data.email,
        city: data.city,
        state: data.state,
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

  // Mobile form progress — the three-step journey: car → model → part.
  const namedParts = parts.filter((p) => p.name.trim().length > 0);
  const hasMake = make.trim().length > 0;
  const hasModel = model.trim().length > 0;
  const hasPart = namedParts.length > 0;
  const progressSteps = [hasMake, hasModel, hasPart];
  const formProgress = Math.round(
    (progressSteps.filter(Boolean).length / progressSteps.length) * 100,
  );
  const isReady = hasMake && hasModel && hasPart;
  const progressLabel = !hasMake
    ? "Add your car"
    : !hasModel
      ? "Select the model"
      : !hasPart
        ? "Add a part"
        : "All set!";

  return (
    <div className="store">
      <BackgroundGrid />

      <div className="app">
        <header>
          <div className="nav">
            <div className="nav-l">
              <button className="lnk" onClick={() => go("help")}>
                How It Works
              </button>
              <button className="lnk" onClick={() => go("contact")}>
                Contact
              </button>
              <button className="lnk" onClick={() => go("orders")}>
                Orders
              </button>
            </div>
            <button className="cartlink" onClick={toggleCart}>
              Cart ( {cart.length} )
            </button>
          </div>

          <div className="cat-bar" aria-label="Categories">
            {HEADER_CATS.map((c) => {
              const [first, ...rest] = c.label.split(" ");
              const name = rest.join(" ");
              return (
                <button
                  key={c.key}
                  type="button"
                  className={`cat-tile ${c.live ? "active" : "soon"}`}
                  style={{ ["--acc" as string]: c.accent }}
                  onClick={() => {
                    if (c.live) {
                      closeCart();
                      setView("home");
                    } else {
                      showToast(`${c.label} - Coming Soon`);
                    }
                  }}
                >
                  <span className="cat-label">
                    <span className="cat-eyebrow">{first}</span>
                    <span className="cat-name">{name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        <div className="stage">
          {/* PRODUCT */}
          <div ref={homeViewRef} className={`view view-home ${view === "home" ? "active" : ""}`}>
            <div className="pdp">
              <div className="info">
                <div className="brand-field" ref={brandFieldRef}>
                  <BrandPicker value={make} onChange={selectBrand} />
                  {makeErr && <div className="err-msg">Please select your car brand.</div>}
                </div>

                <div className="model-field">
                  <div className="step-head"><span className="step-tag">Step 2 -</span> Select your model</div>
                  <ModelPicker
                    brandName={make}
                    value={model}
                    err={modelErr}
                    onChange={(v) => {
                      setModel(v);
                      if (modelErr && v.trim()) setModelErr(false);
                    }}
                  />
                  {modelErr && <div className="err-msg">Please enter your model.</div>}
                </div>
                {/* TEMP: tagline hidden for now — to be reintroduced in a different place. Do not delete.
                <div className="ptag-line">ANY CAR PARTS · WE HAVE IT</div>
                */}
                {/* TEMP: "What you get" description hidden for now — to be reintroduced in a different place. Do not delete.
                <div className="desc">
                  <p>
                    <strong>What you get:</strong> Finding car parts usually means driving into{" "}
                    <span className="flag">sketchy industrial areas</span>, getting{" "}
                    <span className="flag">random prices</span>, second-guessing whether
                    they&apos;re original or <span className="flag">copies</span>, and ending up
                    with the <span className="flag">wrong part</span> that looks exactly the same.
                    We&apos;ve fixed all of it. Just enter your VIN/chassis and your parts list —{" "}
                    <span className="flag-good">we source the exact match</span> for your car and
                    bring it <span className="flag-good">to your door</span>. No hassle, no
                    guesswork: just <span className="flag-good">your car ready</span> and running
                    perfectly.
                  </p>
                </div>
                */}

                <div>
                  <div className="step-head"><span className="step-tag">Step 3 -</span> Select your parts</div>
                  {parts.map((p, i) => (
                    <PartPicker
                      key={i}
                      value={p.name}
                      hintActive={model.trim().length > 0}
                      onChange={(v) => {
                        updatePart(i, { name: v });
                        if (partsErr && v.trim()) setPartsErr(false);
                      }}
                      onRemove={() => removePartRow(i)}
                    />
                  ))}
                </div>
                {partsErr && <div className="err-msg">Please describe at least one part.</div>}
                <button className="addpart" onClick={addPartRow}>
                  + Add another part
                </button>

                <div className="pdp-actions">
                  {/* Order Now is the single conversion action — it adds the
                      vehicle and opens the cart. In edit mode we instead show
                      Save Changes / Cancel for the vehicle being edited. */}
                  {!editing && (
                    <button className="rowbtn find-btn" onClick={() => saveItem(true)}>
                      <span>
                        FIND MY PART — <span className="free-pump">100% Free</span>
                      </span>
                    </button>
                  )}
                  {editing && (
                    <button className="rowbtn" onClick={() => saveItem(false)}>
                      <span>Save Changes</span>
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
                    <div className="hint">
                      Editing vehicle {editIndex! + 1} — save with the button above.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <a
              className="social-proof"
              href="https://maps.app.goo.gl/LDPovtM4EmaZGwwA7?g_st=ic"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Rated 5.0 out of 5 on Google — 5.9K+ parts found"
            >
              <span className="sp-rating" aria-hidden="true">5.0</span>
              <span className="sp-meter" aria-hidden="true">
                <span className="sp-meter-base">★★★★★</span>
                <span className="sp-meter-fill">★★★★★</span>
              </span>
              <span className="sp-div" aria-hidden="true" />
              <span className="sp-count" aria-hidden="true">5.9K+ Parts Found</span>
            </a>
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
            <ContactView onHelp={() => go("help")} />
          </div>

          {/* ORDERS */}
          <div className={`view ${view === "orders" ? "active" : ""}`}>
            <OrdersView active={view === "orders"} />
          </div>

          {/* HOW IT WORKS / FAQ */}
          <div className={`view ${view === "help" ? "active" : ""}`}>
            <HelpView />
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
                  <span className="vin">{vinLabel(it)}</span>
                </div>
                {carLabel(it) && <div className="car">{carLabel(it).toUpperCase()}</div>}
                <ul>
                  {it.parts.map((p, j) => (
                    <li key={j}>
                      <span className="pn">{p.name.toUpperCase()}</span>
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
                <s>AED 287</s> <b className="free">FREE</b>
              </span>
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
              <span>Add Another Part</span>
              <span className="dot" />
            </button>
          </div>
        )}
      </aside>

      <div className={`addbar ${addBar ? "show" : ""}`}>PRODUCT ADDED TO CART</div>
      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>

      {/* Mobile bottom tab bar (hidden on desktop via CSS) */}
      <nav className="botnav" aria-label="Primary">
        {view === "home" && (
          <div
            className="botnav-progress"
            role="progressbar"
            aria-valuenow={formProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Order progress"
          >
            <div className="bp-head">
              <span className="bp-label">{progressLabel}</span>
              <span className="bp-pct">{formProgress}%</span>
            </div>
            <div className="bp-track">
              <span className="bp-tick" style={{ left: "33.33%" }} />
              <span className="bp-tick" style={{ left: "66.66%" }} />
              <div
                className={`bp-fill ${formProgress >= 100 ? "full" : isReady ? "ready" : ""}`}
                style={{ width: `${formProgress}%` }}
              />
            </div>
          </div>
        )}
        <div className="botnav-row">
          <button
            type="button"
            className={`botnav-item ${view === "contact" ? "active" : ""}`}
            onClick={() => go("contact")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Contact</span>
          </button>
          <button
            type="button"
            className={`botnav-item ${view === "orders" ? "active" : ""}`}
            onClick={() => go("orders")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h6" />
            </svg>
            <span>Orders</span>
          </button>
          <button
            type="button"
            className={`botnav-item ${cartOpen ? "active" : ""}`}
            onClick={toggleCart}
          >
            <span className="botnav-ico-wrap">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cart.length > 0 && <span className="botnav-badge">{cart.length}</span>}
            </span>
            <span>Cart</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function buildOrderWaLink(humanIds: string[], vehicles: CartItem[], data: CheckoutData): string {
  let msg = `NEW ORDER ${humanIds.join(", ")} — SPAREZY\n`;
  msg += `Name: ${data.name}\nPhone: ${data.phone}\n`;
  msg += `City: ${[data.city, data.state, data.country].filter(Boolean).join(", ")}\n`;
  msg += `Address: ${data.address}\n`;
  vehicles.forEach((it, i) => {
    const label = carLabel(it) || "Car";
    msg += `\nVehicle ${i + 1}${humanIds[i] ? " (" + humanIds[i] + ")" : ""} — ${label}\n`;
    it.parts.forEach((p) => {
      msg += `• ${p.name}\n`;
    });
  });
  if (data.notes) msg += `\nNote: ${data.notes}\n`;
  return `https://wa.me/${BUSINESS_WA}?text=${encodeURIComponent(msg)}`;
}
