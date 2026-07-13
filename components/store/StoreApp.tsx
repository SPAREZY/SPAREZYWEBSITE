"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CartItem } from "@/lib/store-types";
import { slugForBrand } from "@/lib/car-brands";
import { trackAddToCart, trackLead } from "@/lib/analytics";
import BackgroundGrid from "./BackgroundGrid";
import ContactView from "./ContactView";
import HelpView from "./HelpView";
import BrandPicker from "./BrandPicker";
import ModelPicker from "./ModelPicker";
import PartPicker from "./PartPicker";
import PayBanners from "./PayBanners";
import Reviews from "./Reviews";
import SparezyLogo from "./SparezyLogo";

type View = "home" | "contact" | "help";

// Header category tiles. Only the first (the live part finder) works; the
// rest are "Soon" teasers. Icons live in /public/cat-icons.
const HEADER_CATS = [
  { key: "battery", label: "Buy Battery", img: "/cat-icons/battery.png", accent: "34 197 94", art: "/cat-icons/battery-art.svg" },
  { key: "oil", label: "Buy Lubricant", img: "/cat-icons/oil.png", accent: "40 120 255", art: "/cat-icons/lubricant.svg" },
  { key: "part", label: "Find Auto Parts", img: "/cat-icons/part.png", accent: "249 115 22", live: true, art: "/cat-icons/brake.svg" },
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

// Desktop shows three empty part rows by default so the form fills its column;
// mobile keeps the single compact row. (SSR-safe: server renders one row.)
function defaultParts(): FormPart[] {
  const desktop =
    typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
  return desktop ? [{ name: "" }, { name: "" }, { name: "" }] : [{ name: "" }];
}

export default function StoreApp() {
  const [view, setView] = useState<View>("home");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [addBar, setAddBar] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // product form
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [parts, setParts] = useState<FormPart[]>([{ name: "" }]);
  const [makeErr, setMakeErr] = useState(false);
  const [modelErr, setModelErr] = useState(false);
  const [partsErr, setPartsErr] = useState(false);

  const addBarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On desktop, expand the pristine single part row to the three defaults.
  useEffect(() => {
    setParts((prev) => (prev.length === 1 && !prev[0].name ? defaultParts() : prev));
  }, []);
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

  function go(v: View) {
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
    setParts(defaultParts());
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

  // Place order = hand the inquiry straight to a human on WhatsApp. The cart
  // already holds everything we need, so we pre-fill the chat with the full
  // request and open it in one tap — no form, no extra page.
  function placeOrder() {
    if (cart.length === 0) return;
    // Conversion event for ad platforms (Google / Meta / TikTok).
    trackLead({ count: cart.length });
    const waLink = buildCartWaLink(cart);
    closeCart();
    window.open(waLink, "_blank", "noopener,noreferrer");
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
            </div>
            <button className="cartlink" onClick={toggleCart}>
              Cart ( {cart.length} )
            </button>
          </div>

          <div className="cat-bar" aria-label="Categories">
            {HEADER_CATS.map((c) => {
              return (
                <button
                  key={c.key}
                  type="button"
                  className={`cat-tile ${c.key === "part" ? "cat-tile--wide " : ""}${c.live ? "active" : "soon"}`}
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
                    <span className="cat-name">{c.label}</span>
                  </span>
                  {"art" in c && c.art && (
                    <span className="cat-ico" aria-hidden="true">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.art} alt="" loading="lazy" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        <div className="stage">
          {/* PRODUCT */}
          <div ref={homeViewRef} className={`view view-home ${view === "home" ? "active" : ""}`}>
            <div className="hero-row">
              <aside className="hero-aside">
                <SparezyLogo width={300} maxWidth="100%" />
                <h1 className="hero-title">Any part, any car — just ask.</h1>
                <p className="hero-sub">
                  Spare parts, batteries, lubricants and body parts, sourced and
                  delivered across the UAE. No part number? No stress — we have it.
                </p>
              </aside>
            <div className="pdp">
              <div className="info">
                <div className="brand-field" ref={brandFieldRef}>
                  <BrandPicker value={make} onChange={selectBrand} />
                  {makeErr && <div className="err-msg">Please select your car brand.</div>}
                </div>

                <div className="model-field">
                  <div className="step-head">Select your model</div>
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
                  <div className="step-head">Select your parts</div>
                  {parts.map((p, i) => (
                    <PartPicker
                      key={i}
                      value={p.name}
                      hintActive={model.trim().length > 0}
                      hintOffset={i}
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
                    </button>
                  )}
                  {editing && (
                    <button className="rowbtn secondary" onClick={cancelEdit}>
                      <span>Cancel Editing</span>
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
            </div>
            <div className="store-foot">
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
              <Reviews />
              <div className="store-end">
                <SparezyLogo width={380} maxWidth="80%" />
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div className={`view ${view === "contact" ? "active" : ""}`}>
            <ContactView onHelp={() => go("help")} />
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
          <PayBanners />
          {cart.length === 0 ? (
            <div className="drawer-empty">YOUR CART IS EMPTY</div>
          ) : (
            <>
              {cart.map((it, i) => {
                const slug = slugForBrand(it.make);
                const partCount = it.parts.reduce((s, p) => s + (p.qty || 1), 0);
                return (
                  <div className="vrow" key={i}>
                    <div className="vrow-media">
                      <div className="vrow-img">
                        {slug ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/brand-logos/${slug}.png`} alt={it.make} loading="lazy" />
                        ) : (
                          <span className="vrow-img-fallback">
                            {(it.make || "?").charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="vrow-ctrls">
                        <button
                          className="vrow-ctrl"
                          onClick={() => removeItem(i)}
                          aria-label="Remove vehicle"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12M10 11v5M14 11v5" />
                          </svg>
                        </button>
                        <span className="vrow-ctrl-div" aria-hidden="true" />
                        <button
                          className="vrow-ctrl"
                          onClick={() => editItem(i)}
                          aria-label="Add another part"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="vrow-info">
                      <div className="vrow-title">
                        Vehicle {i + 1} — {[it.make, it.model].filter(Boolean).join(" ")}
                      </div>
                      <div className="vrow-plabel">
                        Parts requested - {partCount} item{partCount === 1 ? "" : "s"}
                      </div>
                      <div className="vrow-parts">
                        {it.parts.map((p, j) => (
                          <div className="vrow-part" key={j}>
                            <span className="vrow-qty">{p.qty || 1} ×</span>
                            {p.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="drawer-subtotal">
              <span>Subtotal</span>
              <span className="sub-price">
                <b className="free">FREE</b>
              </span>
            </div>
            <button className="rowbtn" onClick={placeOrder}>
              <span>Place Order</span>
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
            className={`botnav-item ${view === "home" && !cartOpen ? "active" : ""}`}
            onClick={() => {
              closeCart();
              go("home");
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <path d="M9 22V12h6v10" />
            </svg>
            <span>Home</span>
          </button>
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

// Build the WhatsApp hand-off straight from the cart — a warm, ready-to-send
// message listing every vehicle and the parts requested.
// One part as a natural phrase: "a fuel filter", "an oil filter",
// "brake pads" (plural → no article).
function partPhrase(name: string): string {
  // lowercase the leading letter, but keep acronyms (AC, ABS, EGR…) intact
  const n =
    name.length > 1 && name[1] === name[1].toLowerCase()
      ? name[0].toLowerCase() + name.slice(1)
      : name;
  if (/s$/i.test(n.trim())) return n; // plural-looking → no article
  return (/^[aeiou]/i.test(n) ? "an " : "a ") + n;
}

// "a, b & c"
function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} & ${items[items.length - 1]}`;
}

// Friendly one-sentence WhatsApp ask, e.g.
// "Hi, can you source a fuel filter & brake pads for my Mitsubishi Attrage?"
function buildCartWaLink(vehicles: CartItem[]): string {
  const clauses = vehicles.map((it) => {
    const car = [it.make, it.model].filter(Boolean).join(" ").trim() || "car";
    const parts = joinList(it.parts.map((p) => partPhrase(p.name)));
    return `${parts} for my ${car}`;
  });
  const joined =
    clauses.length > 1
      ? `${clauses.slice(0, -1).join(", ")}, and ${clauses[clauses.length - 1]}`
      : clauses[0] ?? "";
  const msg = `Hi, can you source ${joined}?`;
  return `https://wa.me/${BUSINESS_WA}?text=${encodeURIComponent(msg)}`;
}
