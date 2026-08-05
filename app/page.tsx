import episode from "../data/latest-episode.json";
import { RadioPlayer } from "./radio-player";

const formatSigned = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ShareCapsule Radio home">
          <span className="brand-mark" aria-hidden="true">
            SC
          </span>
          <span>
            <strong>ShareCapsule</strong>
            <small>RADIO</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#markets">Markets</a>
          <a href="#stocks">Stocks</a>
          <a href="#briefing">Briefing</a>
          <a href="#archive">Archive</a>
        </nav>
        <div className="broadcast-status">
          <span className="live-dot" aria-hidden="true" />
          {episode.mode === "production" ? "ON AIR" : "DEMO FEED"}
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">THE MARKET BEFORE THE MARKET</p>
          <h1>Wake up to the signal, not the noise.</h1>
          <p className="hero-intro">
            A concise global-market briefing focused on the active names,
            overnight moves and events that can shape today&apos;s Indian session.
          </p>
          <div className="hero-meta">
            <span>EP {String(episode.episodeNumber).padStart(3, "0")}</span>
            <span>{episode.displayDate}</span>
            <span>{episode.duration}</span>
          </div>
        </div>

        <RadioPlayer
          audioUrl={episode.audioUrl}
          duration={episode.duration}
          narration={episode.narration}
          title={episode.title}
        />
      </section>

      {episode.mode !== "production" && (
        <aside className="demo-notice" role="note">
          <strong>Interface preview</strong>
          <span>
            Figures are illustrative. Live publication stays disabled until
            licensed market and news feeds are configured.
          </span>
        </aside>
      )}

      <section className="education-disclaimer" aria-labelledby="education-disclaimer-title">
        <p className="eyebrow">IMPORTANT LISTENER NOTICE</p>
        <div>
          <h2 id="education-disclaimer-title">Education, not investment advice.</h2>
          <p>
            ShareCapsule Radio is provided solely for educational and
            informational purposes. Nothing on this page or in any broadcast is
            investment, financial, legal or tax advice. Listeners remain solely
            responsible for their financial decisions. ShareCapsule Radio and
            its publishers are not responsible for decisions, trades, losses or
            other outcomes based on this content. Please do your own research
            and consult a qualified financial professional when appropriate.
          </p>
        </div>
      </section>

      <section className="market-strip" id="markets" aria-label="World markets">
        {episode.markets.map((market) => (
          <article key={market.symbol}>
            <span>{market.label}</span>
            <strong>{market.value}</strong>
            <em className={market.change >= 0 ? "positive" : "negative"}>
              {formatSigned(market.change)}
            </em>
          </article>
        ))}
      </section>

      <section className="content-grid" id="briefing">
        <article className="briefing-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">TODAY&apos;S BRIEFING</p>
              <h2>{episode.title}</h2>
            </div>
            <span className="cutoff">Cutoff {episode.dataCutoff}</span>
          </div>
          <p className="briefing-summary">{episode.summary}</p>
          <ol className="driver-list">
            {episode.drivers.map((driver, index) => (
              <li key={driver.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{driver.title}</h3>
                  <p>{driver.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <aside className="signal-card">
          <p className="eyebrow">SIGNAL BOARD</p>
          <h2>What matters now</h2>
          <div className="signal-meter" aria-label="Illustrative risk signal: balanced">
            <span />
          </div>
          <div className="signal-labels">
            <span>Risk-off</span>
            <strong>{episode.riskSignal}</strong>
            <span>Risk-on</span>
          </div>
          <dl>
            {episode.signals.map((signal) => (
              <div key={signal.label}>
                <dt>{signal.label}</dt>
                <dd>{signal.value}</dd>
              </div>
            ))}
          </dl>
          <p className="signal-footnote">
            Scenario indicators describe conditions; they are not trade calls.
          </p>
        </aside>
      </section>

      <section className="stocks-section" id="stocks">
        <div className="section-heading">
          <div>
            <p className="eyebrow">HIGH-ACTIVITY WATCH</p>
            <h2>Stocks in focus</h2>
          </div>
          <p>Ranked by activity, volatility, news impact and popularity.</p>
        </div>
        <div className="stock-grid">
          {episode.stocks.map((stock, index) => (
            <article className="stock-card" key={stock.symbol}>
              <div className="stock-rank">{String(index + 1).padStart(2, "0")}</div>
              <div className="stock-main">
                <div>
                  <h3>{stock.symbol}</h3>
                  <p>{stock.name}</p>
                </div>
                <span className="score">{stock.score} score</span>
              </div>
              <p className="stock-reason">{stock.reason}</p>
              <div className="stock-tags">
                {stock.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="archive-section" id="archive">
        <div>
          <p className="eyebrow">DAILY AT 06:15 IST</p>
          <h2>One briefing. Every market morning.</h2>
          <p>
            Each episode preserves its transcript, evidence links, data cutoff
            and corrections so listeners can verify what they hear.
          </p>
        </div>
        <div className="archive-card">
          <span>LATEST EPISODE</span>
          <strong>{episode.title}</strong>
          <p>{episode.displayDate}</p>
          <a href="#top">Listen from the top <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">SC</span>
          <span><strong>ShareCapsule</strong><small>RADIO</small></span>
        </div>
        <p>
          Educational and informational content only. Not investment advice.
          Listeners remain responsible for their financial decisions.
        </p>
        <div>
          <a href="/feed.xml">RSS</a>
          <a href="#briefing">Methodology</a>
        </div>
      </footer>
    </main>
  );
}
