// Visual "where to find your VIN" helper — three animated SVG illustrations
// (windshield, registration card, door), each with a pulsing green highlight
// on where the VIN sits.
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

      <figure className="vinhelp-card">
        <div className="vinhelp-art">
          <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round">
            {/* car body / jamb behind the open door */}
            <path d="M41 7 L49 10 V42 L41 39" />
            {/* open door panel */}
            <rect x="15" y="9" width="24" height="30" rx="2.5" />
            {/* window */}
            <rect x="19" y="13" width="16" height="8" rx="1" />
            {/* handle */}
            <path d="M20 27 h6" />
            {/* VIN sticker on the door edge, highlighted */}
            <rect className="vh-hl" x="19" y="30" width="13" height="5" rx="1" />
          </svg>
        </div>
        <figcaption className="vinhelp-cap">
          <b>Door jamb</b>
          <span>Sticker inside the driver&apos;s door</span>
        </figcaption>
      </figure>
    </div>
  );
}
