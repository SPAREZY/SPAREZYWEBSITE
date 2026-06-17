"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isValidChassis } from "@/lib/utils";
import type { CartItem, CheckoutData, OrderRecap } from "@/lib/store-types";
import { carLabel, vinLabel } from "@/lib/store-types";
import { rememberOrders } from "@/lib/tracked-orders";
import { trackAddToCart, trackInitiateCheckout, trackLead } from "@/lib/analytics";
import { decodeVin, isVin } from "@/lib/vin";
import BackgroundGrid from "./BackgroundGrid";
import SparezyLogo from "./SparezyLogo";
import CheckoutView from "./CheckoutView";
import ConfirmView from "./ConfirmView";
import ContactView from "./ContactView";
import OrdersView from "./OrdersView";
import HelpView from "./HelpView";
import VinHelp from "./VinHelp";
import RotatingPlaceholder from "./RotatingPlaceholder";
import BrandPicker from "./BrandPicker";

type View = "home" | "checkout" | "confirm" | "contact" | "orders" | "help";

// Rotating example placeholders that scroll until the customer types.
const EG_VIN = ["JTEBH3FJ20K123456", "JN8AZ2NE9DT001234", "GF-BH5", "ZN6-0012345"];
const EG_PART = [
  "Front brake pads",
  "Oil filter",
  "Headlight",
  "Alternator",
  "Side mirror",
  "Radiator",
  "Timing belt",
  "Shock absorber",
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
// qty is kept as a string in the form so the field can start empty (customer
// must type it); it is parsed to a number when the item is added to the cart.
type FormPart = { name: string; qty: string };
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
  const [parts, setParts] = useState<FormPart[]>([{ name: "", qty: "" }]);
  const [photo, setPhoto] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [vinErr, setVinErr] = useState(false);
  const [makeErr, setMakeErr] = useState(false);
  const [partsErr, setPartsErr] = useState(false);
  const [qtyErr, setQtyErr] = useState(false);
  const [vinDecoding, setVinDecoding] = useState(false);
  const [vinNote, setVinNote] = useState<string | null>(null);

  const addBarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const homeViewRef = useRef<HTMLDivElement>(null);
  const lastDecodedVin = useRef<string>("");
  const vinFieldRef = useRef<HTMLDivElement>(null);
  const brandFieldRef = useRef<HTMLDivElement>(null);
  const [vinHelpOpen, setVinHelpOpen] = useState(false);

  // Auto-fill Make / Model / Year from a full 17-char VIN (free NHTSA decode,
  // done browser-side). Debounced; only fills fields the customer hasn't
  // already typed; fails silently so it never blocks the form. Chassis codes
  // won't decode.
  useEffect(() => {
    const v = vin.trim().toUpperCase();
    setVinNote(null);
    if (!isVin(v)) return;
    if (v === lastDecodedVin.current) return;
    const curMake = make.trim();
    const curModel = model.trim();
    const curYear = year.trim();
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setVinDecoding(true);
      const d = await decodeVin(v, ctrl.signal);
      if (ctrl.signal.aborted) return; // customer kept typing — drop this result
      lastDecodedVin.current = v;
      let filled = 0;
      if (d.make && !curMake) { setMake(d.make); filled++; }
      if (d.model && !curModel) { setModel(d.model); filled++; }
      if (d.year && !curYear) { setYear(String(d.year)); filled++; }
      if (filled > 0) {
        setVinNote("Filled from your VIN — edit if anything's off.");
      } else if (!d.make && !d.model && !d.year) {
        setVinNote("Couldn't read this VIN automatically — please add Make / Model / Year.");
      }
      setVinDecoding(false);
    }, 650);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vin]);

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

  // Logo acts as the "home" button. In this single-page storefront the home
  // view is the main page, so we always return to it, close the cart, and
  // scroll back to the top — that way the click has visible feedback even
  // when the home view is already showing.
  function goHome() {
    closeCart();
    setView("home");
    requestAnimationFrame(() =>
      homeViewRef.current?.scrollTo({ top: 0, behavior: "smooth" }),
    );
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
    setParts([{ name: "", qty: "" }]);
    setPhoto("");
    setVinErr(false);
    setMakeErr(false);
    setPartsErr(false);
    setQtyErr(false);
    setVinNote(null);
    lastDecodedVin.current = "";
  }

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file later
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file.");
      return;
    }
    setPhotoBusy(true);
    try {
      setPhoto(await fileToCompressedDataUrl(file));
      setVinErr(false); // a photo satisfies the "VIN or photo" requirement
    } catch {
      showToast("Couldn't read that image. Try a JPG or PNG.");
    } finally {
      setPhotoBusy(false);
    }
  }

  // Picking a brand sets the make and glides the customer down to the VIN step.
  function selectBrand(v: string) {
    setMake(v);
    if (v) {
      setMakeErr(false);
      requestAnimationFrame(() =>
        vinFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  }

  function updatePart(i: number, patch: Partial<FormPart>) {
    setParts((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function addPartRow() {
    setParts((prev) => [...prev, { name: "", qty: "" }]);
  }
  function removePartRow(i: number) {
    setParts((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  function saveItem(direct: boolean) {
    const vinNorm = vin.trim().toUpperCase();
    const cleanParts = parts
      .map((p) => ({ name: p.name.trim(), qty: parseInt(p.qty, 10) }))
      .filter((p) => p.name);
    // The customer can EITHER type a VIN/chassis OR upload a photo of the
    // registration card — only flag the VIN when neither is provided.
    const badBrand = !make.trim();
    const badVin = !isValidChassis(vinNorm) && !photo;
    const badParts = cleanParts.length === 0;
    const badQty = cleanParts.some((p) => !Number.isFinite(p.qty) || p.qty < 1);
    setMakeErr(badBrand);
    setVinErr(badVin);
    setPartsErr(badParts);
    setQtyErr(!badParts && badQty);
    if (badBrand || badVin || badParts || badQty) {
      // Brand sits at the top, far from the buttons — guide the eye to it.
      if (badBrand) {
        brandFieldRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    const item: CartItem = { vin: vinNorm, make, model, year, parts: cleanParts, photo: photo || undefined };
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
    setParts(
      it.parts.length
        ? it.parts.map((p) => ({ name: p.name, qty: String(p.qty) }))
        : [{ name: "", qty: "" }],
    );
    setPhoto(it.photo ?? "");
    setVinErr(false);
    setMakeErr(false);
    setPartsErr(false);
    setQtyErr(false);
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

  // Mobile form progress — every required step rewards the bar so it climbs
  // smoothly: brand → vehicle (VIN/photo) → part → quantity. All four are
  // required to add to cart / checkout.
  const namedParts = parts.filter((p) => p.name.trim().length > 0);
  const hasVehicle = isValidChassis(vin.trim().toUpperCase()) || !!photo;
  const hasMake = make.trim().length > 0;
  const hasPart = namedParts.length > 0;
  const hasQty = hasPart && namedParts.every((p) => parseInt(p.qty, 10) >= 1);
  const progressSteps = [hasMake, hasVehicle, hasPart, hasQty];
  const formProgress = Math.round(
    (progressSteps.filter(Boolean).length / progressSteps.length) * 100,
  );
  const isReady = hasMake && hasVehicle && hasPart && hasQty;
  const progressLabel = !hasMake
    ? "Add your car"
    : !hasVehicle
      ? "Add your VIN / Chassis"
      : !hasPart
        ? "Add a part"
        : !hasQty
          ? "Set the quantity"
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
            <button
              type="button"
              className="nav-logo"
              onClick={goHome}
              aria-label="SPAREZY — go to home"
            >
              <SparezyLogo />
            </button>
            <button className="cartlink" onClick={toggleCart}>
              Cart ( {cart.length} )
            </button>
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
                <h1 className="ptitle">The Finder</h1>
                <div className="ptag-line">ANY CAR PARTS · WE HAVE IT</div>
                <div className="social-proof" aria-label="Rated 4.6 out of 5 — 5.3K+ parts found">
                  <span className="sp-rating" aria-hidden="true">4.6</span>
                  <span className="sp-meter" aria-hidden="true">
                    <span className="sp-meter-base">★★★★★</span>
                    <span className="sp-meter-fill">★★★★★</span>
                  </span>
                  <span className="sp-div" aria-hidden="true" />
                  <span className="sp-count" aria-hidden="true">5.3K+ Parts Found</span>
                </div>
                <div className="price">
                  <s className="was">AED 287</s> <b className="free-tag">FREE</b>
                </div>
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

                <div className="f" ref={vinFieldRef}>
                  <label>Enter VIN / Chassis or upload a photo</label>
                  <div className="f-field">
                    <input
                      className={`vin-input ${vinErr ? "err" : ""}`}
                      maxLength={32}
                      value={vin}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setVin(val);
                        if (vinErr && isValidChassis(val.trim())) setVinErr(false);
                      }}
                    />
                    <RotatingPlaceholder show={vin.length === 0} items={EG_VIN} />
                  </div>
                  {vinErr && (
                    <div className="err-msg">
                      Enter the VIN / chassis number or upload a VIN / chassis photo.
                    </div>
                  )}
                  {vinDecoding && <div className="vin-decode">🔎 Reading your VIN…</div>}
                  {!vinDecoding && vinNote && <div className="vin-decode ok">✓ {vinNote}</div>}
                  {photo ? (
                    <div className="vin-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photo} alt="VIN / chassis photo" />
                      <button type="button" className="vin-thumb-x" onClick={() => setPhoto("")}>✕</button>
                    </div>
                  ) : (
                    <label className={`vin-upload ${photoBusy ? "busy" : ""}`}>
                      <input type="file" accept="image/*" onChange={onPickPhoto} hidden disabled={photoBusy} />
                      {photoBusy ? "Processing…" : "📷 Upload a photo of the chassis / VIN"}
                    </label>
                  )}
                  <button
                    type="button"
                    className="vin-help-toggle"
                    onClick={() => setVinHelpOpen((o) => !o)}
                  >
                    {vinHelpOpen ? "▲" : "▼"} Where do I find my VIN / Chassis?
                  </button>
                  {vinHelpOpen && <VinHelp />}
                </div>

                <div>
                  <div className="part-row part-head">
                    <span className="ph-label">Parts needed for this car</span>
                    <span className="ph-label">Qty</span>
                    <span />
                  </div>
                  {parts.map((p, i) => (
                    <div className="part-row" key={i}>
                      <div className="f-field">
                        <input
                          className="p-name"
                          aria-label="Part name"
                          value={p.name}
                          onChange={(e) => {
                            updatePart(i, { name: e.target.value });
                            if (partsErr && e.target.value.trim()) setPartsErr(false);
                          }}
                        />
                        <RotatingPlaceholder show={p.name.length === 0} items={EG_PART} />
                      </div>
                      <input
                        className="p-qty"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        aria-label="Quantity"
                        value={p.qty}
                        onChange={(e) => {
                          const v = e.target.value.replace(/[^0-9]/g, "");
                          updatePart(i, { qty: v });
                          if (qtyErr && v && parseInt(v) >= 1) setQtyErr(false);
                        }}
                      />
                      <button className="del" title="Remove" onClick={() => removePartRow(i)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                {partsErr && <div className="err-msg">Please describe at least one part.</div>}
                {qtyErr && <div className="err-msg">Please enter a quantity for every part.</div>}
                <button className="addpart" onClick={addPartRow}>
                  + Add another part
                </button>

                <div className="pdp-actions">
                  {/* Green "press-in" effect is reserved for the conversion
                      action (going to checkout); Add to Cart is the calmer
                      outline button. In edit mode Save Changes is primary. */}
                  <button
                    className={`rowbtn ${editing ? "" : "secondary"}`}
                    onClick={() => saveItem(false)}
                  >
                    <span>{editing ? "Save Changes" : "Add to Cart"}</span>
                    <span className="dot" />
                  </button>
                  {!editing && (
                    <button className="rowbtn" onClick={() => saveItem(true)}>
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
                    <div className="hint">
                      Editing vehicle {editIndex! + 1} — save with the button above.
                    </div>
                  )}
                </div>
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
              <span>Add Another Vehicle</span>
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
    const label = carLabel(it);
    const vinText = it.vin && it.vin.trim() ? it.vin : "see VIN / chassis photo";
    msg += `\nVehicle ${i + 1}${humanIds[i] ? " (" + humanIds[i] + ")" : ""} — VIN: ${vinText}${
      label ? " (" + label + ")" : ""
    }\n`;
    it.parts.forEach((p) => {
      msg += `• ${p.name} x${p.qty}\n`;
    });
  });
  if (data.notes) msg += `\nNote: ${data.notes}\n`;
  return `https://wa.me/${BUSINESS_WA}?text=${encodeURIComponent(msg)}`;
}
