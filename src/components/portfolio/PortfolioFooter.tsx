export default function PortfolioFooter() {
  return (
    <footer className="portfolio-footer" aria-label="页面结束">
      <div className="portfolio-footer__glow" aria-hidden="true" />
      <div className="portfolio-footer__inner">
        <div className="portfolio-footer__heading">
          <span className="portfolio-footer__end">END OF SIGNAL</span>
          <span className="portfolio-footer__continue">but the listening continues.</span>
        </div>

        <div className="portfolio-footer__signal" aria-hidden="true">
          <svg
            className="portfolio-footer__wave"
            viewBox="0 0 1200 36"
            preserveAspectRatio="none"
            focusable="false"
          >
            <defs>
              <linearGradient id="portfolio-footer-wave-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(185, 180, 216, 0.55)" />
                <stop offset="55%" stopColor="rgba(140, 160, 210, 0.32)" />
                <stop offset="100%" stopColor="rgba(237, 233, 223, 0.16)" />
              </linearGradient>
            </defs>
            <path
              className="portfolio-footer__wave-path"
              d="M0 18
                 C40 10, 70 26, 110 18
                 S180 8, 220 18
                 S290 28, 340 18
                 S410 12, 460 18
                 S530 24, 580 18
                 S650 14, 700 18
                 S760 21, 820 18
                 S880 16.5, 940 18
                 S1000 18.8, 1060 18
                 L1200 18"
              fill="none"
              stroke="url(#portfolio-footer-wave-stroke)"
              strokeWidth="1.25"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="portfolio-footer__meta">
          <span>© 2026 Yz 香菜</span>
          <span>Music · Data · AI</span>
        </div>

        <img
          className="portfolio-footer__cat"
          src="/assets/cat-footer.gif"
          alt=""
          aria-hidden="true"
          draggable={false}
        />
      </div>
    </footer>
  );
}
