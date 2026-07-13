// "Buy now, pay later" bar shown at the top of the cart — the tabby wordmark on
// its brand mint background with a short tagline. Presentational only.
export default function PayBanners() {
  return (
    <div className="pay-banners">
      <div className="pay-banner pay-tabby">
        <span className="pay-logo">
          <img className="pay-logo-img" src="/pay/tabby.png" alt="tabby" loading="lazy" />
        </span>
        <span className="pay-text">
          <span className="pay-line1">BUY NOW</span>
          <span className="pay-line2">PAY LATER WITH TABBY</span>
        </span>
        {/* tabby CARD illustration at the end of the bar (transparent cutout) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pay-art" src="/pay/tabby-card.png" alt="" aria-hidden="true" loading="lazy" />
      </div>
    </div>
  );
}
