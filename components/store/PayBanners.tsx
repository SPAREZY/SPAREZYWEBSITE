// "Buy now, pay later" banners shown at the top of the cart, mirroring the
// tabby / tamara strips in the noon app. Uses the official logo artwork
// (trimmed to transparent PNGs in /public/pay). Purely presentational.
export default function PayBanners() {
  return (
    <div className="pay-banners">
      <div className="pay-banner">
        <img className="pay-logo-img" src="/pay/tabby.png" alt="tabby" loading="lazy" />
        <span className="pay-text">
          Split into <b>4 interest-free</b> payments
        </span>
      </div>
      <div className="pay-banner">
        <img className="pay-logo-img" src="/pay/tamara.png" alt="tamara" loading="lazy" />
        <span className="pay-text">
          Pay in <b>4</b> or up to <b>6 months</b> — 0% interest
        </span>
      </div>
    </div>
  );
}
