import type { OrderRecap } from "@/lib/store-types";
import { carLabel, vinLabel } from "@/lib/store-types";

export default function ConfirmView({
  recap,
  onBack,
}: {
  recap: OrderRecap | null;
  onBack: () => void;
}) {
  if (!recap) return null;
  return (
    <div className="confirm-wrap">
      <div className="order-no-label">Order Number</div>
      <div className="order-no">{recap.humanIds.join(" · ")}</div>
      <p className="body">
        ON IT. YOUR PARTS ARE BEING TRACKED DOWN. WE&apos;LL CONFIRM AND CONTACT YOU SOON.
      </p>

      <a
        href={recap.waLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
        <span className="rowbtn" style={{ display: "flex" }}>
          <span>Send This Order via WhatsApp</span>
        </span>
      </a>

      <button className="rowbtn secondary" onClick={onBack}>
        <span>Back to Store</span>
      </button>

      <div className="confirm-list">
        {recap.vehicles.map((it, i) => (
          <div className="vrow" key={i}>
            <div className="vh">
              <span className="vt">
                Vehicle {i + 1}
                {recap.humanIds[i] ? ` — ${recap.humanIds[i]}` : ""}
              </span>
              <span className="vin">{vinLabel(it)}</span>
            </div>
            {carLabel(it) && <div className="car">{carLabel(it)}</div>}
            <ul>
              {it.parts.map((p, j) => (
                <li key={j}>
                  <span>{p.name}</span>
                  <span className="q">× {p.qty}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="vrow">
          <div className="car">
            <strong style={{ color: "#fff" }}>{recap.name}</strong> · {recap.phone} ·{" "}
            {[recap.city, recap.state, recap.country].filter(Boolean).join(", ")}
            <br />
            {recap.address}
            {recap.notes ? (
              <>
                <br />
                Note: {recap.notes}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
