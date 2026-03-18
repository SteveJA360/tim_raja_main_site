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
  business,
  campaignPages,
  faqs,
  highlightCards,
  locations,
  navLinks,
  pricingCards,
  promisePoints,
  quotes,
  serviceGroups,
  testimonials,
} from "./data/siteData";


const ctaNoise = new Set([
  "GET IN TOUCH",
  "BOOK NOW",
  "LET'S TALK",
  "BEGIN YOUR JOURNEY",
  "Schedule A Zoom Call",
  "Learn more",
  "Click",
  "here",
]);
let generatedPagesCache;
let generatedPagesPromise;


function normalizePath(pathname) {
  return pathname.replace(/^\/+|\/+$/g, "");
}

function formatTitle(title) {
  if (!title) {
    return business.siteName;
  }

  if (title.includes("Tim Raja Hypnotherapy")) {
    return title;
  }

  return `${title} | ${business.siteName}`;
}

function loadGeneratedPages() {
  if (generatedPagesCache) {
    return Promise.resolve(generatedPagesCache);
  }

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
      return () => {
        active = false;
      };
    }

    setLoading(true);

    loadGeneratedPages().then((pages) => {
      if (!active) {
        return;
      }

      setPage(pages.find((item) => item.slug === slug));
      setLoading(false);
    });

    return () => {
      active = false;
    };
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return null;
}

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="site-shell">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route
            path="/about"
            element={
              <CorePage
                slug="about"
                badge="About Tim Raja"
                title="Practical therapy shaped by real life, work pressure and family experience."
                intro="Tim Raja moved from senior leadership into therapy because he wanted to spend his time helping people create real change rather than chasing company sales targets."
                sideNote="Clinical hypnotherapist, EMDR practitioner, Master NLP Practitioner and father of four."
                image={business.aboutImage}
                quote={quotes.about}
                quoteAuthor={quotes.aboutAuthor}
              />
            }
          />
          <Route
            path="/hypnotherapy"
            element={
              <CorePage
                slug="hypnotherapy"
                badge="Clinical Hypnotherapy"
                title="A clear, evidence-led route for breaking patterns, calming symptoms and changing behaviour."
                intro="The original site positioned hypnotherapy as a professional, non-intrusive way to unlock change when willpower alone has stopped working. This rebuild keeps that tone and presents it more cleanly."
                sideNote="Suitable for anxiety, unhealthy habits, stress, weight loss, phobias, sleep issues, pain and more."
                image={business.heroImage}
                quote={quotes.home}
                quoteAuthor={quotes.homeAuthor}
              />
            }
          />
          <Route
            path="/emdr"
            element={
              <CorePage
                slug="emdr"
                badge="EMDR Therapy"
                title="A focused trauma therapy page built for trust, clarity and enquiries."
                intro="EMDR is presented here as a structured, evidence-based therapy for trauma and distressing life events, with the eight-stage process explained in plain English."
                sideNote="Useful for trauma, PTSD and other distressing memories, with sessions guided carefully and at the client’s pace."
                image={business.emdrImage}
                quote="Needing help doesn’t have a look, but asking for it is always beautiful."
                quoteAuthor="Brittany Burgunder"
              />
            }
          />
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
      <div className="site-header__inner container">
        <Link className="brand" to="/">
          <img className="brand__mark" src={business.logo} alt={business.siteName} />
          <div>
            <p className="brand__eyebrow">{business.person}</p>
            <p className="brand__title">Clinical Hypnotherapy</p>
          </div>
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
            Call {business.phoneDisplay}
          </a>
        </nav>
      </div>
    </header>
  );
}

function HomePage() {
  usePageTitle("Tim Raja Hypnotherapy");

  return (
    <>
      <section className="hero">
        <div className="hero__glow hero__glow--one" />
        <div className="hero__glow hero__glow--two" />
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">Clinical hypnotherapy and EMDR</p>
            <h1>
              Professional support for anxiety, stress, PTSD, phobias, habits and
              performance.
            </h1>
            <p className="hero__lede">
              A stronger, conversion-focused version of Tim Raja’s existing site,
              rebuilt from the archived content and structured around trust, clarity
              and enquiry generation.
            </p>

            <div className="hero__actions">
              <Link className="button button--solid" to="/contact">
                Book the free introduction
              </Link>
              <a className="button button--ghost" href={business.phoneHref}>
                Call {business.phoneDisplay}
              </a>
            </div>

            <ul className="hero__points">
              {promisePoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="hero__panel">
            <div className="hero-card">
              <img className="hero-card__logo" src={business.cardLogo} alt={business.person} />
              <p className="hero-card__label">{business.freeIntro}</p>
              <h2>
                Calm, direct therapy with in-person and online options.
              </h2>
              <p>
                Sessions are available in Cheltenham, Oxford, near Cirencester or
                remotely by Zoom.
              </p>
              <Link className="button button--solid button--block" to="/contact">
                Start with a quick call
              </Link>
            </div>
            <img className="hero__image" src={business.heroImage} alt={business.person} />
          </div>
        </div>
      </section>

      <section className="proof-strip">
        <div className="container proof-strip__inner">
          {business.proofLogos.map((logo) => (
            <img key={logo.src} src={logo.src} alt={logo.alt} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container section__intro">
          <p className="eyebrow">Why this works</p>
          <h2>The tone stays familiar, but the presentation is sharper and more premium.</h2>
        </div>
        <div className="container card-grid">
          {highlightCards.map((card) => (
            <article key={card.title} className="info-card">
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container section__intro">
          <p className="eyebrow">Treatment Areas</p>
          <h2>Core services are surfaced quickly, with the deeper archive still preserved.</h2>
        </div>
        <div className="container service-groups">
          {serviceGroups.map((group) => (
            <article key={group.label} className="service-group">
              <p className="service-group__label">{group.label}</p>
              <div className="chip-grid">
                {group.items.map((item) => (
                  <Link key={item.href} className="chip-link" to={item.href}>
                    {item.title}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container split-panel">
          <div className="split-panel__content">
            <p className="eyebrow">About Tim Raja</p>
            <h2>Built around credibility, not wellness fluff.</h2>
            <p>
              Tim’s archived copy is clear about who he is: a certified clinical
              hypnotherapist, EMDR practitioner, Master NLP Practitioner and
              performance coach who spent 25 years at senior manager level before
              changing direction.
            </p>
            <p>
              That background matters. It gives the site a grounded voice that works
              well for people dealing with pressure, performance issues, anxiety or a
              long-running habit they want to break.
            </p>
            <Link className="button button--ghost" to="/about">
              Read Tim’s story
            </Link>
          </div>
          <img className="split-panel__image" src={business.aboutImage} alt={business.person} />
        </div>
      </section>

      <section className="section section--contrast">
        <div className="container section__intro section__intro--light">
          <p className="eyebrow">Pricing & Programmes</p>
          <h2>Clear pricing blocks make the buying path easier to understand.</h2>
        </div>
        <div className="container price-grid">
          {pricingCards.map((card) => (
            <article key={card.title} className="price-card">
              <p className="price-card__title">{card.title}</p>
              <p className="price-card__price">{card.price}</p>
              <p className="price-card__detail">{card.detail}</p>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
        <div className="container section__actions">
          <Link className="button button--solid" to="/pricing">
            See the pricing page
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container section__intro">
          <p className="eyebrow">Testimonials</p>
          <h2>The strongest proof from the original site has been kept and cleaned up.</h2>
        </div>
        <div className="container testimonial-grid">
          {testimonials.slice(0, 4).map((item) => (
            <article key={item.author} className="testimonial-card">
              <p className="testimonial-card__quote">“{item.quote}”</p>
              <p className="testimonial-card__author">{item.author}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container section__intro">
          <p className="eyebrow">Campaign Routes</p>
          <h2>Google Ads landing pages and local service routes are still available.</h2>
        </div>
        <div className="container campaign-grid">
          {campaignPages.map((page) => (
            <Link key={page.href} className="campaign-card" to={page.href}>
              <h3>{page.label}</h3>
              <p>{page.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container quote-panel">
          <p className="quote-panel__text">“{quotes.home}”</p>
          <p className="quote-panel__author">{quotes.homeAuthor}</p>
        </div>
      </section>

      <ContactBand />
    </>
  );
}

function CorePage({ slug, badge, title, intro, sideNote, image, quote, quoteAuthor }) {
  const { page, loading } = useGeneratedPage(slug);
  usePageTitle(page?.title || title);

  if (loading && !page) {
    return <LoadingPage />;
  }

  return (
    <>
      <PageHero
        badge={badge}
        title={title}
        intro={intro}
        image={image || page?.image || business.heroImage}
      />
      <section className="section">
        <div className="container article-shell">
          <article className="article-card">
            <p className="article-callout">{sideNote}</p>
            <ContentStream lines={page?.lines || []} />
          </article>
          <aside className="article-sidebar">
            <SidebarCard />
          </aside>
        </div>
      </section>
      <section className="section">
        <div className="container quote-panel">
          <p className="quote-panel__text">“{quote}”</p>
          <p className="quote-panel__author">{quoteAuthor}</p>
        </div>
      </section>
      <ContactBand />
    </>
  );
}

function PricingPage() {
  usePageTitle("Pricing & Programmes");

  return (
    <>
      <PageHero
        badge="Pricing"
        title="Simple pricing, stronger explanations and less friction before enquiry."
        intro="The legacy pricing content is still preserved, but the main offer is now surfaced as clean programme cards with short descriptions that help people decide faster."
        image="/archive-assets/wp-content/uploads/2021/06/life-coach-34.jpg"
      />
      <section className="section">
        <div className="container price-grid">
          {pricingCards.map((card) => (
            <article key={card.title} className="price-card price-card--light">
              <p className="price-card__title">{card.title}</p>
              <p className="price-card__price">{card.price}</p>
              <p className="price-card__detail">{card.detail}</p>
              <p>{card.copy}</p>
            </article>
          ))}
        </div>
      </section>
      <LegacyArticle slug="pricing" badge="Archived Pricing Copy" />
      <ContactBand />
    </>
  );
}

function TestimonialsPage() {
  usePageTitle("Testimonials");

  return (
    <>
      <PageHero
        badge="Testimonials"
        title="Social proof is kept front and centre, because this is a trust-led service."
        intro="The original site’s testimonials have been preserved and presented as clearer, easier-to-scan review cards."
        image="/archive-assets/wp-content/uploads/2021/07/pexels-nathan-cowley-897817-1.jpg"
      />
      <section className="section">
        <div className="container testimonial-grid testimonial-grid--full">
          {testimonials.map((item) => (
            <article key={`${item.author}-${item.quote.slice(0, 20)}`} className="testimonial-card">
              <p className="testimonial-card__quote">“{item.quote}”</p>
              <p className="testimonial-card__author">{item.author}</p>
            </article>
          ))}
        </div>
      </section>
      <ContactBand />
    </>
  );
}

function ContactPage() {
  usePageTitle("Contact");

  return (
    <>
      <PageHero
        badge="Contact"
        title="A more useful contact page with the existing HubSpot form preserved."
        intro="The original contact route used a HubSpot form. That form is still embedded here, alongside FAQs and clear practice location details."
        image="/archive-assets/wp-content/uploads/2021/06/life-coach-25.jpg"
      />

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-form-card">
            <p className="eyebrow">Send an enquiry</p>
            <h2>{business.freeIntro}</h2>
            <p>
              Use the existing live form or contact Tim directly by phone or email.
            </p>
            <HubspotForm />
          </div>

          <div className="contact-side">
            <div className="mini-card">
              <p className="mini-card__label">Direct contact</p>
              <a href={business.phoneHref}>{business.phoneDisplay}</a>
              <a href={business.emailHref}>{business.email}</a>
            </div>
            <div className="mini-card">
              <p className="mini-card__label">Practice locations</p>
              {locations.map((location) => (
                <div key={location.name} className="location-block">
                  <p className="location-block__title">{location.name}</p>
                  <p>{location.venue}</p>
                  {location.address.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--tinted">
        <div className="container section__intro">
          <p className="eyebrow">Frequently Asked</p>
          <h2>The reassuring education from the original contact page is still here.</h2>
        </div>
        <div className="container faq-list">
          {faqs.map((faq) => (
            <details key={faq.question} className="faq-item">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

function PageResolver() {
  const location = useLocation();
  const slug = normalizePath(location.pathname);
  const { page, loading } = useGeneratedPage(slug);

  if (loading && !page) {
    return <LoadingPage />;
  }

  if (!page) {
    return <NotFoundPage />;
  }

  return <GeneratedPage page={page} />;
}

function GeneratedPage({ page }) {
  usePageTitle(page.title);

  return (
    <>
      <PageHero
        badge="Archived Page"
        title={page.title.replace(" | Tim Raja Hypnotherapy", "")}
        intro={
          page.excerpt ||
          "This route has been preserved from the previous site and re-presented inside the new design."
        }
        image={page.image || business.heroImage}
      />
      <section className="section">
        <div className="container article-shell">
          <article className="article-card">
            <ContentStream lines={page.lines} />
          </article>
          <aside className="article-sidebar">
            <SidebarCard />
          </aside>
        </div>
      </section>
      <ContactBand />
    </>
  );
}

function NotFoundPage() {
  usePageTitle("Page Not Found");

  return (
    <section className="section section--full-height">
      <div className="container empty-state">
        <p className="eyebrow">404</p>
        <h1>That page isn’t in the rebuilt site.</h1>
        <p>
          The main routes and archived marketing pages have been retained. Head back
          home or jump to the contact page.
        </p>
        <div className="hero__actions">
          <Link className="button button--solid" to="/">
            Go home
          </Link>
          <Link className="button button--ghost" to="/contact">
            Contact Tim
          </Link>
        </div>
      </div>
    </section>
  );
}

function PageHero({ badge, title, intro, image }) {
  return (
    <section className="page-hero">
      <div className="container page-hero__grid">
        <div className="page-hero__copy">
          <p className="eyebrow">{badge}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
          <div className="hero__actions">
            <Link className="button button--solid" to="/contact">
              Book a free introduction
            </Link>
            <a className="button button--ghost" href={business.phoneHref}>
              Call now
            </a>
          </div>
        </div>
        <img className="page-hero__image" src={image} alt={title} />
      </div>
    </section>
  );
}

function SidebarCard() {
  return (
    <div className="sidebar-card">
      <p className="sidebar-card__eyebrow">Need help deciding?</p>
      <h3>{business.freeIntro}</h3>
      <p>
        Speak to Tim directly and get a straight answer on whether hypnotherapy or
        EMDR is the right fit for your situation.
      </p>
      <a className="button button--solid button--block" href={business.phoneHref}>
        Call {business.phoneDisplay}
      </a>
      <Link className="button button--ghost button--block" to="/contact">
        Open the contact form
      </Link>
    </div>
  );
}

function ContactBand() {
  return (
    <section className="section section--contact-band">
      <div className="container contact-band">
        <div>
          <p className="eyebrow">Ready to talk?</p>
          <h2>Start with a quick, private introduction and take it from there.</h2>
        </div>
        <div className="contact-band__actions">
          <Link className="button button--solid" to="/contact">
            Contact Tim
          </Link>
          <a className="button button--ghost" href={business.emailHref}>
            Email directly
          </a>
        </div>
      </div>
    </section>
  );
}

function LegacyArticle({ slug, badge }) {
  const { page } = useGeneratedPage(slug);
  if (!page) {
    return null;
  }

  return (
    <section className="section">
      <div className="container article-shell">
        <article className="article-card">
          <p className="article-callout">{badge}</p>
          <ContentStream lines={page.lines} />
        </article>
        <aside className="article-sidebar">
          <SidebarCard />
        </aside>
      </div>
    </section>
  );
}

function ContentStream({ lines }) {
  const cleaned = lines.filter((line) => line && !ctaNoise.has(line));

  return (
    <div className="content-stream">
      {cleaned.map((line, index) => {
        if (isEyebrow(line)) {
          return (
            <p key={`${line}-${index}`} className="content-stream__eyebrow">
              {line}
            </p>
          );
        }

        if (isHeading(line)) {
          return (
            <h3 key={`${line}-${index}`} className="content-stream__heading">
              {line}
            </h3>
          );
        }

        return (
          <p key={`${line}-${index}`} className="content-stream__paragraph">
            {line}
          </p>
        );
      })}
    </div>
  );
}

function isEyebrow(line) {
  return line.length < 32 && line === line.toUpperCase() && /[A-Z]/.test(line);
}

function isHeading(line) {
  if (line.endsWith("?")) {
    return true;
  }

  if (line.length < 68 && /^[A-Z][A-Za-z0-9’'(),/&\-\s]+$/.test(line) && !line.endsWith(".")) {
    return true;
  }

  return false;
}

function HubspotForm() {
  useEffect(() => {
    const target = document.querySelector("#hubspot-contact-form");
    if (!target) {
      return undefined;
    }

    let cancelled = false;

    const createForm = () => {
      if (cancelled || !window.hbspt || !target || target.children.length > 0) {
        return;
      }

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

    return () => {
      cancelled = true;
    };
  }, []);

  return <div id="hubspot-contact-form" className="hubspot-form" />;
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <img className="site-footer__logo" src={business.logo} alt={business.siteName} />
          <p>{business.subtitle}</p>
          <a href={business.phoneHref}>{business.phoneDisplay}</a>
          <a href={business.emailHref}>{business.email}</a>
        </div>

        <div>
          <p className="site-footer__label">Key pages</p>
          <div className="site-footer__links">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="site-footer__label">Locations</p>
          <div className="site-footer__links">
            {locations.map((location) => (
              <p key={location.name}>
                {location.name}
                <span>{location.venue}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function LoadingPage() {
  return (
    <section className="section section--full-height">
      <div className="container empty-state">
        <p className="eyebrow">Loading</p>
        <h1>Opening the archived page…</h1>
        <p>The route exists. The content chunk is just being loaded separately.</p>
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
