// "Buy now, pay later" bars shown at the top of the cart. Each bar is filled
// with the brand's own colours (tabby mint / tamara gradient) with the wordmark
// and a short tagline on top. Presentational only.
export default function PayBanners() {
  return (
    <div className="pay-banners">
      <div className="pay-banner pay-tabby">
        <img className="pay-logo-img" src="/pay/tabby.png" alt="tabby" loading="lazy" />
        <span className="pay-text">Split in up to 12 payments</span>
      </div>
      <div className="pay-banner pay-tamara">
        <img className="pay-logo-img" src="/pay/tamara.png" alt="tamara" loading="lazy" />
        <span className="pay-text">Pay in 6 payments</span>
      </div>
    </div>
  );
}
