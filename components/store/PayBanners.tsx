// "Buy now, pay later" banners shown at the top of the cart. Layout mirrors the
// noon reference: logo pill + bold name + grey sub-line. Presentational only.
export default function PayBanners() {
  return (
    <div className="pay-banners">
      <div className="pay-banner">
        <img className="pay-logo-img" src="/pay/tabby.png" alt="tabby" loading="lazy" />
        <div className="pay-info">
          <span className="pay-title">Tabby</span>
          <span className="pay-text">Split in up to 12 payments</span>
        </div>
      </div>
      <div className="pay-banner">
        <img className="pay-logo-img" src="/pay/tamara.png" alt="tamara" loading="lazy" />
        <div className="pay-info">
          <span className="pay-title">Tamara</span>
          <span className="pay-text">Pay in 6 payments</span>
        </div>
      </div>
    </div>
  );
}
