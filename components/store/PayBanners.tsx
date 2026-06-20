// "Buy now, pay later" banners shown at the top of the cart, mirroring the
// tabby / tamara strips in the noon app. Purely presentational trust badges.
export default function PayBanners() {
  return (
    <div className="pay-banners">
      <div className="pay-banner pay-tabby">
        <span className="pay-logo pay-logo-tabby">tabby</span>
        <span className="pay-text">
          Split into <b>4 interest-free</b> payments
        </span>
      </div>
      <div className="pay-banner pay-tamara">
        <span className="pay-logo pay-logo-tamara">tamara</span>
        <span className="pay-text">
          Pay in <b>4</b> or up to <b>6 months</b> — 0% interest
        </span>
      </div>
    </div>
  );
}
