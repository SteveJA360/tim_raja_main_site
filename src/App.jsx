import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  aboutContent,
  business,
  contactContent,
  emdrContent,
  footerContent,
  homeContent,
  hypnotherapyContent,
  images,
  navLinks,
  pricingContent,
  serviceCategories,
  testimonialsContent,
} from "./data/siteData";

const ctaNoise = new Set([
  "GET IN TOUCH",
  "BOOK NOW",
  "LET'S TALK",
  "Let's Talk",
  "BEGIN YOUR JOURNEY",
  "Schedule A Zoom Call",
  "Learn more",
  "Click",
  "here",
]);

const repeatedLines = new Set([
  "TIM RAJA",
  business.credentials,
  business.subtitle,
  business.summary,
  "Clinical Hypnotherapist, Performance Coach and Master NLP Practitioner",
]);

const displayReplacements = [
  ["â\u20ac\u2122", "'"],
  ["â\u20ac\u0153", '"'],
  ["â\u20ac", '"'],
  ["â\u20ac\u02dc", "'"],
  ["â\u20ac\u201c", "-"],
  ["â\u20ac\u201d", "-"],
  ["â\u20ac\u00a6", "..."],
  ["\u00c2", ""],
  ["\u0141", "\u00a3"],
];

let generatedPagesCache;
let generatedPagesPromise;

function cleanDisplayText(value = "") {
  let text = `${value}`;
  for (const [before, after] of displayReplacements) {
    text = text.replaceAll(before, after);
  }
  return text.replace(/\s+/g, " ").trim();
}

function normalizePath(pathname) {
  return pathname.replace(/^\/+|\/+$/g, "");
}

function formatTitle(title) {
  if (!title) return business.siteName;
  if (title.includes("Tim Raja Hypnotherapy")) return cleanDisplayText(title);
  return `${cleanDisplayText(title)} | ${business.siteName}`;
}

function joinText(previous, next) {
  return `${previous} ${next}`
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/"\s+\./g, '".')
    .trim();
}

function loadGeneratedPages() {
  if (generatedPagesCache) return Promise.resolve(generatedPagesCache);
  if (!generatedPagesPromise) {
    generatedPagesPromise = import("./data/generatedPages").then((module) => {
      generatedPagesCache = module.generatedPages;
      return generatedPagesCache;
    });
  }
  return generatedPagesPromise;
}

function useGeneratedPage(slug) {
  const [page, setPage] = useState(() => generatedPagesCache?.find((item) => item.slug === slug));
  const [loading, setLoading] = useState(!page);

  useEffect(() => {
    let active = true;
    const cached = generatedPagesCache?.find((item) => item.slug === slug);
    if (cached) {
      setPage(cached);
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    loadGeneratedPages().then((pages) => {
      if (!active) return;
      setPage(pages.find((item) => item.slug === slug));
      setLoading(false);
    });
    return () => { active = false; };
  }, [slug]);

  return { page, loading };
}

function usePageTitle(title) {
  useEffect(() => {
    document.title = formatTitle(title);
  }, [title]);
}

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
  return null;
}

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <div className="site-shell">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/hypnotherapy" element={<HypnotherapyPage />} />
          <Route path="/emdr" element={<EMDRPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<PageResolver />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function Header({ menuOpen, setMenuOpen }) {
  return (
    <header className="site-header">
      <div className="site-header__accent" />
      <div className="container site-header__inner">
        <Link className="brand" to="/" aria-label={business.siteName}>
          <img className="brand__logo" src={images.logo} alt={business.siteName} />
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`site-nav ${menuOpen ? "site-nav--open" : ""}`}>
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              className={({ isActive }) => `site-nav__link ${isActive ? "is-active" : ""}`}
              to={link.href}
            >
              {link.label}
            </NavLink>
          ))}
          <a className="button button--solid site-nav__cta" href={business.phoneHref}>
            {homeContent.introButton}
          </a>
        </nav>
      </div>
    </header>
  );
}

function HomePage() {
  usePageTitle(business.fullTitle);

  return (
    <>
      {/* HERO */}
      <section className="home-hero">
        <div className="container home-hero__inner">
          <div className="home-hero__left">
            <p className="kicker">{business.person}</p>
            <p className="meta-line">{business.credentials}</p>
            <h1 className="home-hero__h1">{business.subtitle}</h1>
            <p className="home-hero__summary">{business.summary}</p>
            <h2 className="home-hero__hook">{homeContent.heroTitle}</h2>
            <p className="home-hero__text">{homeContent.heroText}</p>
            <ActionRow>
              <Link className="button button--solid" to="/contact">
                {homeContent.introButton}
              </Link>
              <a className="button button--outline" href={business.phoneHref}>
                {business.phoneDisplay}
              </a>
            </ActionRow>
            <div className="intro-panel">
              <p className="kicker">{business.freeIntro}</p>
              <p>{business.introOffer}</p>
              <p>{business.introOfferDetail}</p>
              <Link className="button button--soft" to="/contact">
                {homeContent.contactButton}
              </Link>
            </div>
          </div>

          <div className="home-hero__right">
            <div className="home-hero__blob" />
            <div className="home-hero__img-wrap">
              <img className="home-hero__portrait" src={images.about} alt={business.person} />
            </div>
            <div className="hero-badge hero-badge--tl">
              <span className="hero-badge__num">25+</span>
              <span className="hero-badge__txt">Years Experience</span>
            </div>
            <div className="hero-badge hero-badge--br">
              <span className="hero-badge__num">Free</span>
              <span className="hero-badge__txt">Intro Zoom Call</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF STRIP */}
      <section className="proof-strip">
        <div className="container proof-strip__inner">
          {business.proofLogos.map((logo) => (
            <img key={logo.src} src={logo.src} alt={logo.alt} />
          ))}
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="stats-strip">
        <div className="container stats-strip__grid">
          <div className="stat-item">
            <p className="stat-item__num">25+</p>
            <p className="stat-item__label">Years Industry Experience</p>
          </div>
          <div className="stat-item">
            <p className="stat-item__num">4–6</p>
            <p className="stat-item__label">Sessions to See Results</p>
          </div>
          <div className="stat-item">
            <p className="stat-item__num">100%</p>
            <p className="stat-item__label">Personalised Treatment</p>
          </div>
          <div className="stat-item">
            <p className="stat-item__num">Free</p>
            <p className="stat-item__label">20 Min Intro Zoom Call</p>
          </div>
        </div>
      </section>

      {/* BREAKTHROUGH BAND */}
      <section className="image-band">
        <div className="container image-band__inner">
          <div className="image-band__panel">
            <p className="kicker">{homeContent.breakthroughEyebrow}</p>
            <h2>{homeContent.breakthroughTitle}</h2>
            {homeContent.breakthroughParagraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <ActionRow>
              <Link className="button button--solid" to="/contact">
                {homeContent.bookButton}
              </Link>
            </ActionRow>
          </div>
        </div>
      </section>

      {/* BENEFIT CARDS */}
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="WHY CHOOSE HYPNOTHERAPY?" title="The Difference It Makes" />
          <div className="benefit-grid">
            {homeContent.benefitPoints.map((point, index) => (
              <article key={point} className={`benefit-card benefit-card--${index + 1}`}>
                <p className="benefit-card__num">0{index + 1}</p>
                <p>{point}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE MATRIX */}
      <ServiceMatrix />

      {/* FAQ */}
      <section className="section section--tint">
        <div className="container faq-layout">
          <article className="faq-layout__intro">
            <SectionHeading
              eyebrow={homeContent.questions.eyebrow}
              title={homeContent.questions.title}
            />
            {homeContent.questions.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </article>
          <div className="faq-layout__list">
            {homeContent.faqs.map((item) => (
              <article key={item.question} className="panel faq-card">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT TIM */}
      <section className="section">
        <div className="container split-section">
          <div className="split-section__content">
            <SectionHeading eyebrow={homeContent.about.eyebrow} title={business.person} />
            {homeContent.about.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <div className="proof-logos--compact">
              {business.proofLogos.map((logo) => (
                <img key={logo.src} src={logo.src} alt={logo.alt} />
              ))}
            </div>
          </div>
          <div className="split-section__media">
            <img className="split-section__image" src={images.about} alt={business.person} />
          </div>
        </div>
      </section>

      {/* RESEARCH */}
      <section className="section section--tint">
        <div className="container split-section split-section--reverse">
          <div className="split-section__media">
            <img className="split-section__image" src={images.research} alt="Hypnotherapy research" />
          </div>
          <article className="split-section__content">
            <p className="kicker">{homeContent.research.eyebrow}</p>
            {homeContent.research.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <blockquote className="research-blockquote">
              &ldquo;{homeContent.research.quote}&rdquo;
              <cite>{homeContent.research.author}</cite>
            </blockquote>
          </article>
        </div>
      </section>

      <QuoteBand quote={homeContent.research.quote} author={homeContent.research.author} />
    </>
  );
}

function AboutPage() {
  usePageTitle("About Me");

  return (
    <>
      <PageHero
        eyebrow={business.person}
        title={aboutContent.title}
        body={[aboutContent.intro]}
        image={images.about}
      />
      <section className="section">
        <div className="container split-section">
          <div className="split-section__content">
            {aboutContent.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="split-section__media">
            <img className="split-section__image" src={images.about} alt={business.person} />
          </div>
        </div>
      </section>
      <section className="section section--tint">
        <div className="container">
          <SectionHeading eyebrow="My Values" title="My Values & Beliefs" />
          <div className="card-grid">
            {aboutContent.values.map((value) => (
              <article key={value.title} className="panel feature-card">
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <SectionHeading eyebrow="Testimonials" title={testimonialsContent.title} />
          <div className="testimonial-grid">
            {aboutContent.testimonials.map((item) => (
              <article key={item.author} className="panel testimonial-card">
                <p className="testimonial-card__quote">&ldquo;{item.quote}&rdquo;</p>
                <p className="testimonial-card__author">{item.author}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <QuoteBand quote={aboutContent.quote} author={aboutContent.author} />
    </>
  );
}

function HypnotherapyPage() {
  usePageTitle("Hypnotherapy");

  return (
    <>
      <PageHero
        eyebrow={hypnotherapyContent.eyebrow}
        title={hypnotherapyContent.title}
        body={hypnotherapyContent.intro}
        image={images.hero}
      />
      <section className="section">
        <div className="container">
          <article className="statement-card panel">
            <p className="kicker">{hypnotherapyContent.overview.eyebrow}</p>
            <h2>{hypnotherapyContent.overview.title}</h2>
            <p>{hypnotherapyContent.overview.text}</p>
          </article>
        </div>
      </section>
      <section className="section section--tint">
        <div className="container card-grid">
          {hypnotherapyContent.features.map((feature) => (
            <article key={feature.title} className="panel feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="container faq-layout faq-layout--single">
          {hypnotherapyContent.faqs.map((item) => (
            <article key={item.question} className="panel faq-card">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section section--tint">
        <div className="container">
          <SectionHeading
            eyebrow="Hypnotherapy"
            title={hypnotherapyContent.examplesTitle}
            intro={hypnotherapyContent.examplesIntro}
          />
          <div className="card-grid card-grid--2">
            {hypnotherapyContent.examples.map((item) => (
              <article key={item.name} className="panel feature-card">
                <h3>{item.name}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="panel note-card">
            <p>{hypnotherapyContent.examplesOutro}</p>
          </div>
        </div>
      </section>
      <ServiceMatrix />
    </>
  );
}

function EMDRPage() {
  usePageTitle("EMDR");

  return (
    <>
      <PageHero eyebrow="EMDR" title={emdrContent.title} body={emdrContent.intro} image={images.emdr} />
      <section className="section">
        <div className="container split-section">
          <article className="split-section__content">
            <SectionHeading eyebrow="EMDR" title={emdrContent.difference.title} />
            {emdrContent.difference.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </article>
          <div className="split-section__media">
            <img className="split-section__image" src={images.emdr} alt={emdrContent.title} />
          </div>
        </div>
      </section>
      <section className="section section--tint">
        <div className="container">
          <SectionHeading eyebrow="EMDR Process" title={emdrContent.stepsTitle} />
          <div className="timeline">
            {emdrContent.steps.map((step, index) => (
              <article key={step.title} className="panel timeline__item">
                <p className="timeline__number">{String(index + 1).padStart(2, "0")}</p>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container card-grid card-grid--2">
          {emdrContent.evidence.map((p) => (
            <article key={p} className="panel feature-card">
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section section--tint">
        <div className="container card-grid">
          {emdrContent.values.map((value) => (
            <article key={value.title} className="panel feature-card">
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </article>
          ))}
        </div>
      </section>
      <QuoteBand quote={emdrContent.quote} author={emdrContent.author} />
    </>
  );
}

function PricingPage() {
  usePageTitle("Pricing");

  return (
    <>
      <PageHero
        eyebrow={business.person}
        title={pricingContent.title}
        body={pricingContent.intro}
        image={images.pricing}
      />
      <section className="section">
        <div className="container pricing-grid">
          {pricingContent.cards.map((card) => (
            <article key={card.eyebrow + card.title} className="panel pricing-card">
              <p className="kicker">{card.eyebrow}</p>
              <h2>{card.title}</h2>
              {card.prices.map((price) => (
                <p key={price} className="pricing-card__price-line">{price}</p>
              ))}
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>
      <ServiceMatrix />
    </>
  );
}

function TestimonialsPage() {
  usePageTitle("Testimonials");

  return (
    <>
      <PageHero
        eyebrow={testimonialsContent.eyebrow}
        title={testimonialsContent.title}
        body={[testimonialsContent.subtitle, testimonialsContent.intro]}
        image={images.contact}
      />
      <section className="section">
        <div className="container testimonial-grid testimonial-grid--full">
          {testimonialsContent.items.map((item) => (
            <article key={item.author + item.quote.slice(0, 20)} className="panel testimonial-card">
              <p className="testimonial-card__quote">&ldquo;{item.quote}&rdquo;</p>
              <p className="testimonial-card__author">{item.author}</p>
            </article>
          ))}
        </div>
      </section>
      <QuoteBand quote={testimonialsContent.quote} author={testimonialsContent.author} />
    </>
  );
}

function ContactPage() {
  usePageTitle("Contact");

  return (
    <>
      <PageHero
        eyebrow={contactContent.title}
        title={contactContent.title}
        body={[contactContent.intro]}
        image={images.contact}
      />
      <section className="section">
        <div className="container contact-layout">
          <article className="panel contact-form-card">
            <p className="kicker">{contactContent.title}</p>
            <h2>{contactContent.intro}</h2>
            <HubspotForm />
          </article>
          <aside className="contact-side">
            <div className="panel contact-panel">
              <p className="kicker">Contact</p>
              <a className="contact-panel__link" href={business.phoneHref}>{business.phoneDisplay}</a>
              <a className="contact-panel__link" href={business.emailHref}>{business.email}</a>
            </div>
            <div className="panel contact-panel">
              <p className="kicker">Our Practice Locations</p>
              {contactContent.locations.map((location) => (
                <div key={location.venue + location.lines[0]} className="location-block">
                  <p className="location-block__title">{location.venue}</p>
                  {location.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
      <section className="section section--tint">
        <div className="container">
          <SectionHeading eyebrow="Frequently Asked" title="Frequently Asked Questions" />
          <div className="faq-list">
            {contactContent.faqs.map((item) => (
              <details
                key={item.question}
                className="panel faq-item"
                open={item.question === "What is Hypnotherapy?"}
              >
                <summary>{item.question}</summary>
                {item.paragraphs?.map((p) => <p key={p}>{p}</p>)}
                {item.list ? (
                  <ul className="issue-list">
                    {item.list.map((entry) => <li key={entry}>{entry}</li>)}
                  </ul>
                ) : null}
              </details>
            ))}
          </div>
        </div>
      </section>
      <QuoteBand quote={contactContent.quote} author={contactContent.author} />
    </>
  );
}

function PageResolver() {
  const location = useLocation();
  const slug = normalizePath(location.pathname);
  const { page, loading } = useGeneratedPage(slug);
  if (loading && !page) return <LoadingPage />;
  if (!page) return <NotFoundPage />;
  return <GeneratedPage page={page} />;
}

function GeneratedPage({ page }) {
  const title = cleanDisplayText(page.title.replace(" | Tim Raja Hypnotherapy", ""));
  usePageTitle(title);

  return (
    <>
      <PageHero
        eyebrow={business.person}
        title={title}
        body={[page.excerpt || business.summary]}
        image={page.image || images.hero}
      />
      <section className="section">
        <div className="container article-layout">
          <article className="panel article-card article-card--wide">
            <ContentStream lines={page.lines} />
          </article>
          <aside className="panel contact-panel">
            <p className="kicker">{business.freeIntro}</p>
            <a className="contact-panel__link" href={business.phoneHref}>{business.phoneDisplay}</a>
            <a className="contact-panel__link" href={business.emailHref}>{business.email}</a>
            <Link className="button button--solid button--block" to="/contact">
              {homeContent.contactButton}
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}

function PageHero({ eyebrow, title, body, image, actions = true }) {
  return (
    <section className="page-hero">
      <div className="container page-hero__inner">
        <div className="page-hero__content">
          {eyebrow ? <p className="kicker">{eyebrow}</p> : null}
          <h1 className="page-hero__h1">{cleanDisplayText(title)}</h1>
          {body?.map((p) => (
            <p key={p} className="page-hero__body">{cleanDisplayText(p)}</p>
          ))}
          {actions ? (
            <ActionRow>
              <Link className="button button--solid" to="/contact">
                {homeContent.contactButton}
              </Link>
              <a className="button button--outline" href={business.phoneHref}>
                {business.phoneDisplay}
              </a>
            </ActionRow>
          ) : null}
        </div>
        <div className="page-hero__media">
          <img className="page-hero__img" src={image} alt={cleanDisplayText(title)} />
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, intro }) {
  return (
    <div className="section-heading">
      {eyebrow ? <p className="kicker">{eyebrow}</p> : null}
      {title && title.trim() ? <h2 className="section-heading__h2">{cleanDisplayText(title)}</h2> : null}
      {intro ? <p className="section-heading__intro">{cleanDisplayText(intro)}</p> : null}
    </div>
  );
}

function ActionRow({ children }) {
  return <div className="action-row">{children}</div>;
}

function QuoteBand({ quote, author }) {
  return (
    <section className="quote-band">
      <div className="container quote-band__inner">
        <p className="quote-band__text">&ldquo;{cleanDisplayText(quote)}&rdquo;</p>
        <p className="quote-band__author">{cleanDisplayText(author)}</p>
      </div>
    </section>
  );
}

function ServiceMatrix() {
  return (
    <section className="section section--services">
      <div className="container">
        <SectionHeading eyebrow="WHAT DO I TREAT?" title="Areas I Can Help With" />
        <div className="service-grid">
          {serviceCategories.map((service) => (
            <Link
              key={`${service.label}-${service.item}`}
              className="service-card"
              to={service.href}
            >
              {service.image && (
                <div className="service-card__img">
                  <img src={service.image} alt={service.item} loading="lazy" />
                </div>
              )}
              <div className="service-card__body">
                <p className="service-card__label">{service.label}</p>
                <h3>{service.item}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContentStream({ lines }) {
  const prepared = prepareContentLines(lines);

  return (
    <div className="content-stream">
      {prepared.map((line, index) => {
        if (isEyebrow(line)) {
          return (
            <p key={`${line}-${index}`} className="content-stream__eyebrow">{line}</p>
          );
        }
        if (isHeading(line)) {
          return (
            <h3 key={`${line}-${index}`} className="content-stream__heading">{line}</h3>
          );
        }
        return (
          <p key={`${line}-${index}`} className="content-stream__paragraph">{line}</p>
        );
      })}
    </div>
  );
}

function prepareContentLines(lines = []) {
  const prepared = [];

  for (let index = 0; index < lines.length; index += 1) {
    let line = cleanDisplayText(lines[index]);

    if (!line || ctaNoise.has(line) || repeatedLines.has(line)) continue;

    if (line === "here" && prepared[prepared.length - 1] === "Click") {
      prepared[prepared.length - 1] = "Click here";
      continue;
    }

    const next = cleanDisplayText(lines[index + 1] || "");

    if (/^[A-Za-z]$/.test(line) && next) {
      line = `${line}${next}`;
      index += 1;
    }

    const previous = prepared[prepared.length - 1];
    const shouldMerge =
      previous &&
      !isStandaloneHeading(previous) &&
      (previous.length < 18 ||
        /\b(the|a|an|of|to|with|and|or|in|on|at|for|from)$/i.test(previous) ||
        previous.endsWith(",") ||
        previous.endsWith('"') ||
        line.startsWith(".") ||
        line.startsWith(",") ||
        line.startsWith(")") ||
        line.startsWith("-") ||
        /^[a-z]/.test(line));

    if (shouldMerge) {
      prepared[prepared.length - 1] = joinText(previous, line);
      continue;
    }

    prepared.push(line);
  }

  return prepared;
}

function isEyebrow(line) {
  return line.length <= 36 && line === line.toUpperCase() && /[A-Z]/.test(line);
}

function isHeading(line) {
  if (line.endsWith("?")) return true;
  return line.length <= 82 && !line.endsWith(".") && /^[A-Z0-9"'(]/.test(line);
}

function isStandaloneHeading(line) {
  return isEyebrow(line) || isHeading(line);
}

function HubspotForm() {
  useEffect(() => {
    const target = document.querySelector("#hubspot-contact-form");
    if (!target) return undefined;
    let cancelled = false;

    const createForm = () => {
      if (cancelled || !window.hbspt || target.children.length > 0) return;
      window.hbspt.forms.create({
        portalId: 25625184,
        formId: "1e95675d-f51a-4346-9cb2-c5cb15c06366",
        region: "eu1",
        target: "#hubspot-contact-form",
      });
    };

    if (window.hbspt) {
      createForm();
    } else {
      const existingScript = document.querySelector('script[data-hubspot-form="true"]');
      if (existingScript) {
        existingScript.addEventListener("load", createForm, { once: true });
      } else {
        const script = document.createElement("script");
        script.src = "https://js-eu1.hsforms.net/forms/embed/v2.js";
        script.async = true;
        script.dataset.hubspotForm = "true";
        script.addEventListener("load", createForm, { once: true });
        document.body.appendChild(script);
      }
    }

    return () => { cancelled = true; };
  }, []);

  return <div id="hubspot-contact-form" className="hubspot-form" />;
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <img className="site-footer__logo" src={images.logo} alt={business.siteName} />
          <p>{footerContent.description}</p>
          <a href={business.phoneHref}>{business.phoneDisplay}</a>
          <a href={business.emailHref}>{business.email}</a>
        </div>
        <div>
          <p className="site-footer__label">Pages</p>
          <div className="site-footer__links">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>{link.label}</Link>
            ))}
          </div>
        </div>
        {footerContent.columns.map((column) => (
          <div key={column.title + column.items[0]}>
            <p className="site-footer__label">{column.title}</p>
            <div className="site-footer__links">
              {column.items.map((item) => <p key={item}>{item}</p>)}
            </div>
          </div>
        ))}
      </div>
      <div className="container site-footer__bottom">
        <p>{footerContent.legal}</p>
      </div>
    </footer>
  );
}

function NotFoundPage() {
  usePageTitle("Page Not Found");
  return (
    <section className="section section--full-height">
      <div className="container empty-state">
        <p className="kicker">404</p>
        <h1>Page not found.</h1>
        <ActionRow>
          <Link className="button button--solid" to="/">Home</Link>
          <Link className="button button--outline" to="/contact">Contact</Link>
        </ActionRow>
      </div>
    </section>
  );
}

function LoadingPage() {
  return (
    <section className="section section--full-height">
      <div className="container empty-state">
        <p className="kicker">Loading</p>
        <h1>Opening the page...</h1>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppShell />
    </BrowserRouter>
  );
}
