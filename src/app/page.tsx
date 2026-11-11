import { Footer, Navbar, WhatsAppButton } from "@/components/Chrome";
import { SunSymbolLarge } from "@/components/SunSymbol";
import { instagramUrl, site } from "@/config/site";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section className="hero">
          <div className="wrap hero__inner">
            <SunSymbolLarge className="hero__sun" />
            <h1 className="wordmark hero__wordmark">{site.name}</h1>
            <p className="tagline">{site.tagline}</p>
            <p className="hero__line">{site.heroLine}</p>
          </div>
        </section>

        <section className="band" aria-label="Portfólio, estúdio e contacto">
          <div className="wrap band__grid">
            <article className="band__block" id="portfolio">
              <h2>portfólio</h2>
              <p>{site.styles}. O portfólio está a ser montado; até lá, os trabalhos mais recentes estão no Instagram.</p>
              <a className="link" href={instagramUrl} target="_blank" rel="noopener noreferrer">
                ver no Instagram →
              </a>
            </article>
            <article className="band__block" id="estudio">
              <h2>estúdio</h2>
              <p>{site.studioLocation}. Mais detalhes em breve.</p>
              {!site.bookingsOpen && (
                <p className="muted">As marcações ainda não estão abertas. Segue o Instagram para saberes quando abrirem.</p>
              )}
            </article>
            <article className="band__block" id="contacto">
              <h2>contacto</h2>
              <p>
                <a className="link" href={instagramUrl} target="_blank" rel="noopener noreferrer">
                  @{site.instagram}
                </a>
              </p>
              <WhatsAppButton />
            </article>
          </div>
        </section>

        <section className="about">
          <div className="wrap about__inner">
            <p className="label">sobre</p>
            <p className="about__text">{site.about}</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
