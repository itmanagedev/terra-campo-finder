import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Terra & Campo — Propriedades Rurais à Venda" },
      {
        name: "description",
        content:
          "Encontre fazendas, sítios e chácaras à venda em todo o Brasil. Terra & Campo Imóveis Rurais.",
      },
      { property: "og:title", content: "Terra & Campo — Propriedades Rurais" },
      {
        property: "og:description",
        content: "Fazendas, sítios e chácaras à venda em todo o Brasil.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
      },
      {
        name: "twitter:image",
        content:
          "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200",
      },
    ],
  }),
  component: Index,
});

type Property = {
  id: string;
  title: string;
  type: string;
  city: string;
  state: string;
  area: number;
  price: number;
  description: string;
  image: string;
  created_at: string;
};

const SORT_OPTIONS = [
  { key: "recent", label: "Mais Recentes" },
  { key: "low", label: "Menor Preço" },
  { key: "high", label: "Maior Preço" },
  { key: "date", label: "Por Data" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["key"];

const formatPrice = (v: number) =>
  "R$ " + v.toLocaleString("pt-BR");

const WhatsAppIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? "bg-background/95 backdrop-blur shadow-sm"
          : "bg-background/80 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
            T
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Terra <span className="text-accent">&</span> Campo
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-foreground md:flex">
          <a href="#" className="hover:text-primary transition-colors">
            Início
          </a>
          <a href="#properties" className="hover:text-primary transition-colors">
            Propriedades
          </a>
          <a href="#contato" className="hover:text-primary transition-colors">
            Contato
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="#properties"
            className="hidden sm:inline-flex rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Ver propriedades
          </a>
          <Link
            to="/admin"
            aria-label="Acessar painel administrativo"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground transition"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920"
          alt="Paisagem rural com campos verdes ao entardecer"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/40 to-foreground/70" />
      </div>
      <div className="mx-auto flex min-h-[78vh] max-w-6xl flex-col items-start justify-center px-4 py-24 text-white">
        <span className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wider backdrop-blur">
          Imóveis rurais selecionados
        </span>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Encontre sua Propriedade Rural Ideal
        </h1>
        <p className="mt-6 max-w-2xl text-base text-white/85 sm:text-lg">
          Fazendas, sítios e chácaras com infraestrutura completa, em
          localizações privilegiadas por todo o Brasil.
        </p>
        <a
          href="#properties"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow-lg hover:translate-y-[-1px] hover:shadow-xl transition"
        >
          Ver propriedades disponíveis
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}

function PropertyCard({ p }: { p: Property }) {
  const waLink = `https://wa.me/558588429467?text=${encodeURIComponent(
    `Olá, tenho interesse na propriedade ${p.title}`,
  )}`;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5 transition hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={p.image}
          alt={`${p.type} ${p.title} em ${p.city}/${p.state}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow">
          {p.type}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-foreground shadow">
          {p.area} ha
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold text-foreground">{p.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <svg
            className="h-4 w-4 text-accent"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {p.city}, {p.state}
        </p>
        <p
          className="mt-3 text-sm text-muted-foreground overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {p.description}
        </p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Valor
            </p>
            <p className="text-xl font-bold text-primary">
              {formatPrice(p.price)}
            </p>
          </div>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow hover:brightness-95 transition"
        >
          <WhatsAppIcon className="h-5 w-5" />
          Tenho interesse
        </a>
      </div>
    </article>
  );
}

function PropertiesSection() {
  const [sort, setSort] = useState<SortKey>("recent");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setProperties(data as Property[]);
        setLoading(false);
      });
  }, []);

  const sorted = useMemo(() => {
    const copy = [...properties];
    switch (sort) {
      case "recent":
      case "date":
        return copy.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      case "low":
        return copy.sort((a, b) => a.price - b.price);
      case "high":
        return copy.sort((a, b) => b.price - a.price);
      default:
        return copy;
    }
  }, [sort, properties]);

  return (
    <section id="properties" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-8 flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          Propriedades
        </span>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Imóveis rurais à venda
        </h2>
        <p className="max-w-2xl text-muted-foreground">
          Selecione o critério de ordenação e encontre a propriedade ideal para
          você.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {SORT_OPTIONS.map((opt) => {
          const active = sort === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <p className="text-muted-foreground">Carregando propriedades...</p>
      ) : sorted.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma propriedade disponível no momento.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sorted.map((p) => (
            <PropertyCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function Footer() {
  return (
    <footer
      id="contato"
      className="bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
            T
          </span>
          <span className="font-semibold">Terra & Campo Imóveis Rurais</span>
        </div>
        <p className="text-sm opacity-80">
          © 2024 Terra & Campo Imóveis Rurais. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

function FloatingWhatsApp() {
  const href =
    "https://wa.me/558588429467?text=" +
    encodeURIComponent("Olá, tenho interesse em uma propriedade");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl ring-4 ring-[#25D366]/20 hover:scale-110 transition"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <PropertiesSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
