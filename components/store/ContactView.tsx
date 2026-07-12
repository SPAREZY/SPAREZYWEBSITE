export default function ContactView({ onHelp }: { onHelp?: () => void }) {
  return (
    <div className="sheet">
      <h2>Contact</h2>
      <div style={{ marginTop: 26 }}>
        <div className="cline">
          <span className="k">Phone</span>
          <span className="v">
            <a href="tel:+971522250600">(+971) 52 225 0600</a>
          </span>
        </div>
        <div className="cline">
          <span className="k">Email</span>
          <span className="v">
            <a href="mailto:gotparts@sparezy.store">gotparts@sparezy.store</a>
          </span>
        </div>
        <div className="cline">
          <span className="k">Location</span>
          <span className="v">
            <a href="https://maps.app.goo.gl/jox7uguMGnN6G8mP6" target="_blank" rel="noopener noreferrer">
              M7 — Musaffah Industrial, Abu Dhabi, UAE
            </a>
          </span>
        </div>
        <div className="cline">
          <span className="k">WhatsApp</span>
          <span className="v">
            <a href="https://wa.me/971522250600" target="_blank" rel="noopener noreferrer">
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
