// "Buy now, pay later" bars shown at the top of the cart. Each bar is filled
// with the brand's own colours (tabby mint / tamara gradient) with the wordmark
// and a short tagline on top. The wordmark sits in a fixed-width slot so both
// taglines start at the same x. Presentational only.
export default function PayBanners() {
  return (
    <div className="pay-banners">
      <div className="pay-banner pay-tabby">
        <span className="pay-logo">
          <img className="pay-logo-img" src="/pay/tabby.png" alt="tabby" loading="lazy" />
        </span>
        <span className="pay-text">Buy now, pay later</span>
      </div>
      <div className="pay-banner pay-tamara">
        <span className="pay-logo">
          <img className="pay-logo-img" src="/pay/tamara.png" alt="tamara" loading="lazy" />
        </span>
        <span className="pay-text">Pay in 4 payments</span>
      </div>
    </div>
  );
}
