// Contact lines lead with an icon (call / mail / location / WhatsApp) instead
// of text labels — the value says the rest.
const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function ContactView({ onHelp }: { onHelp?: () => void }) {
  return (
    <div className="sheet">
      <h2>Contact</h2>
      <div style={{ marginTop: 26 }}>
        <div className="cline">
          <span className="c-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" {...stroke}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </span>
          <span className="v">
            <a href="tel:+971522250600" aria-label="Call us">+971 52 225 0600</a>
          </span>
        </div>
        <div className="cline">
          <span className="c-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" {...stroke}>
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <span className="v">
            <a href="mailto:gotparts@sparezy.store" aria-label="Email us">gotparts@sparezy.store</a>
          </span>
        </div>
        <div className="cline">
          <span className="c-ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" {...stroke}>
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <span className="v">
            <a href="https://maps.app.goo.gl/jox7uguMGnN6G8mP6" target="_blank" rel="noopener noreferrer" aria-label="Find us on Google Maps">
              M7 — Musaffah Industrial, Abu Dhabi, UAE
            </a>
          </span>
        </div>
        <div className="cline">
          <span className="c-ico" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
              <path d="M16.004 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.257.59 4.46 1.71 6.402L3.2 28.8l6.57-1.72a12.74 12.74 0 0 0 6.234 1.59h.005c7.07 0 12.8-5.73 12.8-12.8 0-3.42-1.332-6.635-3.75-9.053A12.71 12.71 0 0 0 16.004 3.2zm0 23.36h-.004a10.57 10.57 0 0 1-5.385-1.475l-.386-.23-3.9 1.022 1.04-3.8-.252-.39a10.56 10.56 0 0 1-1.62-5.637c0-5.84 4.756-10.595 10.6-10.595a10.53 10.53 0 0 1 7.494 3.106 10.53 10.53 0 0 1 3.102 7.496c0 5.84-4.755 10.595-10.6 10.595zm5.81-7.93c-.318-.16-1.884-.93-2.176-1.036-.292-.106-.504-.16-.716.16-.212.318-.822 1.035-1.008 1.247-.186.212-.372.239-.69.08-.318-.16-1.344-.495-2.56-1.58-.946-.844-1.585-1.887-1.77-2.205-.186-.318-.02-.49.14-.648.143-.143.318-.372.477-.558.16-.186.212-.318.318-.53.106-.212.053-.398-.027-.558-.08-.16-.716-1.726-.98-2.363-.258-.62-.52-.536-.716-.546l-.61-.01c-.212 0-.557.08-.85.398-.292.318-1.114 1.09-1.114 2.656 0 1.567 1.14 3.08 1.3 3.292.16.212 2.244 3.426 5.434 4.805.76.328 1.352.524 1.815.67.762.243 1.456.209 2.004.127.611-.091 1.884-.77 2.15-1.514.265-.744.265-1.382.186-1.514-.08-.133-.292-.213-.61-.372z" />
            </svg>
          </span>
          <span className="v">
            <a href="https://wa.me/971522250600" target="_blank" rel="noopener noreferrer" aria-label="Message us on WhatsApp">
              Message us
            </a>
          </span>
        </div>
      </div>
      {onHelp && (
        <button type="button" className="contact-help" onClick={onHelp}>
          How it works &amp; FAQ →
        </button>
      )}
    </div>
  );
}
