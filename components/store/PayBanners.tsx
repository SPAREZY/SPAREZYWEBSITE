// "Buy now, pay later" bar shown at the top of the cart — the tabby wordmark on
// its brand mint background with a short tagline. Presentational only.
export default function PayBanners() {
  return (
    <div className="pay-banners">
      <div className="pay-banner pay-tabby">
        <span className="pay-logo">
          <img className="pay-logo-img" src="/pay/tabby.png" alt="tabby" loading="lazy" />
        </span>
        <span className="pay-text">Buy now, pay later</span>
        {/* photo panel at native scale (no stretching) with a long fade into the mint */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pay-art" src="/pay/tabby-tap-hd.jpg" alt="" aria-hidden="true" loading="lazy" />
      </div>
    </div>
  );
}
