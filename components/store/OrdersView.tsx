"use client";

import { useCallback, useEffect, useState } from "react";
import { readTrackedOrders } from "@/lib/tracked-orders";

type TrackedOrder = {
  humanId: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  car: string;
  vinLast: string;
  parts: { name: string; qty: number }[];
  quote: { price: number; condition: string; eta: string | null } | null;
};

const STATUS_CLASS: Record<string, string> = {
  RECEIVED: "st-received",
  SOURCING: "st-sourcing",
  QUOTED: "st-quoted",
  CONFIRMED: "st-confirmed",
  COMPLETED: "st-completed",
  DECLINED: "st-declined",
};

export default function OrdersView({ active }: { active: boolean }) {
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const merge = useCallback((incoming: TrackedOrder[]) => {
    setOrders((prev) => {
      const map = new Map<string, TrackedOrder>();
      for (const o of [...prev, ...incoming]) map.set(o.humanId, o);
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }, []);

  const loadDevice = useCallback(async () => {
    const saved = readTrackedOrders();
    if (saved.phone) setPhone((p) => p || saved.phone || "");
    if (!saved.ids.length) {
      setSearched(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?ids=${encodeURIComponent(saved.ids.join(","))}`);
      const data = await res.json();
      if (res.ok) merge(data.orders ?? []);
    } catch {
      /* ignore device-load errors; phone lookup still works */
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [merge]);

  // Refresh this device's orders (and their statuses) each time the page opens.
  useEffect(() => {
    if (active) loadDevice();
  }, [active, loadDevice]);

  async function lookupByPhone(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      setError("Enter the phone number you ordered with.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (res.ok) {
        merge(data.orders ?? []);
        setSearched(true);
      } else {
        setError(data?.error || "Could not look up orders.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="sheet">
      <h2>Your Orders</h2>

      <form className="ord-lookup" onSubmit={lookupByPhone}>
        <input
          className="ord-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="ADD PHONE NUMBER TO TRACK"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button className="ord-track" type="submit" disabled={loading}>
          {loading ? "Checking…" : "Track"}
        </button>
      </form>
      {error && <div className="err-msg">{error}</div>}

      <div className="ord-list">
        {orders.length === 0 ? (
          <div className="drawer-empty">
            {searched ? "NO ORDERS FOUND YET" : "LOADING YOUR ORDERS…"}
          </div>
        ) : (
          orders.map((o) => (
            <div className="vrow" key={o.humanId}>
              <div className="vh">
                <span className="vt">{o.humanId}</span>
                <span className={`ord-status ${STATUS_CLASS[o.status] ?? ""}`}>
                  {o.statusLabel}
                </span>
              </div>
              {o.car && <div className="car">{o.car.toUpperCase()}</div>}
              {o.vinLast && <div className="vin">VIN …{o.vinLast}</div>}
              <ul>
                {o.parts.map((p, j) => (
                  <li key={j}>
                    <span className="pn">{p.name.toUpperCase()}</span>
                    <span className="q">× {p.qty}</span>
                  </li>
                ))}
              </ul>
              {o.quote && (
                <div className="ord-quote">
                  QUOTE: AED {o.quote.price} · {o.quote.condition.toUpperCase()}
                  {o.quote.eta ? ` · ${o.quote.eta}` : ""}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
