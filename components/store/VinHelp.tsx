// Visual "where to find your VIN" helper — three animated SVG illustrations
// (windshield, door jamb, registration card) replacing the old bullet list.
export default function VinHelp() {
  return (
    <div className="vinhelp">
      <figure className="vinhelp-card">
        <div className="vinhelp-art">
          <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
            {/* windshield + dashboard */}
            <path d="M12 28 L20 12 H44 L52 28 Z" />
            <path d="M9 31 H55" />
            <path d="M7 39 H57" />
            {/* VIN plate on the dash, driver side */}
            <rect className="vh-hl" x="17" y="23.5" width="13" height="5" rx="1" />
            {/* magnifier hovering over it */}
            <g className="vh-float">
              <circle cx="24" cy="26" r="5.5" />
              <path d="M28 30 l3.5 3.5" />
            </g>
          </svg>
        </div>
        <figcaption className="vinhelp-cap">
          <b>Windshield</b>
          <span>Driver-side dash, through the glass</span>
        </figcaption>
      </figure>

      <figure className="vinhelp-card">
        <div className="vinhelp-art">
          <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
            {/* door opening / B-pillar */}
            <path d="M14 38 V14 H36 a3 3 0 0 1 3 3 V38" />
            <path d="M9 38 H44" />
            {/* open door panel */}
            <path d="M41 18 L56 22 V38 L41 34 Z" />
            <path d="M45 23 H53" />
            {/* sticker on the jamb */}
            <rect className="vh-hl" x="31" y="22" width="6" height="9" rx="1" />
          </svg>
        </div>
        <figcaption className="vinhelp-cap">
          <b>Door jamb</b>
          <span>Sticker inside the driver&apos;s door</span>
        </figcaption>
      </figure>

      <figure className="vinhelp-card">
        <div className="vinhelp-art">
          <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
            {/* registration card */}
            <rect x="10" y="9" width="44" height="30" rx="3" />
            <circle cx="18" cy="17" r="3.2" />
            <path d="M25 14 H48" />
            <path d="M25 19 H45" />
            {/* highlighted VIN line */}
            <rect className="vh-hl" x="14" y="25.5" width="36" height="5" rx="1" />
            <path d="M14 35 H38" />
            {/* shine sweep */}
            <g className="vh-shine">
              <path d="M16 9 L8 39" strokeWidth={6} stroke="rgba(255,255,255,0.18)" />
            </g>
          </svg>
        </div>
        <figcaption className="vinhelp-cap">
          <b>Registration</b>
          <span>Your car&apos;s reg card</span>
        </figcaption>
      </figure>
    </div>
  );
}
