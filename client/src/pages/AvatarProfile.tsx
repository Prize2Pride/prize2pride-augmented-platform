import { useRoute, Link } from "wouter";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, MapPin, Globe, Brain, Zap } from "lucide-react";

type CityKey = "berlin" | "moscow" | "london";

const CITY_CONFIGS: Record<CityKey, {
  color: string;
  borderClass: string;
  bgClass: string;
  accentClass: string;
  flag: string;
  emoji: string;
  gradient: string;
  knowledge: string[];
  quote: string;
  quoteAuthor: string;
}> = {
  berlin: {
    color: "oklch(0.72 0.15 220)",
    borderClass: "berlin-border",
    bgClass: "berlin-bg",
    accentClass: "berlin-accent",
    flag: "🇩🇪",
    emoji: "🏛️",
    gradient: "from-blue-600/15 via-transparent to-transparent",
    knowledge: [
      "Quantum Field Theory",
      "Kantian Ethics",
      "Structural Engineering",
      "Hegelian Dialectics",
      "Particle Physics",
      "German Idealism",
      "Computational Mathematics",
      "Architectural Theory",
    ],
    quote: "Zwei Dinge erfüllen das Gemüt mit immer neuer und zunehmender Bewunderung und Ehrfurcht: der bestirnte Himmel über mir und das moralische Gesetz in mir.",
    quoteAuthor: "Immanuel Kant, Kritik der praktischen Vernunft",
  },
  moscow: {
    color: "oklch(0.72 0.18 15)",
    borderClass: "moscow-border",
    bgClass: "moscow-bg",
    accentClass: "moscow-accent",
    flag: "🇷🇺",
    emoji: "⭐",
    gradient: "from-red-600/15 via-transparent to-transparent",
    knowledge: [
      "Number Theory",
      "Russian Literature",
      "Thermodynamics",
      "Dostoevsky Studies",
      "Periodic Table Chemistry",
      "Tolstoyan Philosophy",
      "Ballet & Performing Arts",
      "Soviet Space Science",
    ],
    quote: "Красота спасёт мир.",
    quoteAuthor: "Фёдор Михайлович Достоевский, Идиот",
  },
  london: {
    color: "oklch(0.78 0.12 75)",
    borderClass: "london-border",
    bgClass: "london-bg",
    accentClass: "london-accent",
    flag: "🇬🇧",
    emoji: "👑",
    gradient: "from-amber-500/15 via-transparent to-transparent",
    knowledge: [
      "Evolutionary Biology",
      "Industrial Innovation",
      "Shakespearean Literature",
      "Economic Theory",
      "Newtonian Physics",
      "Colonial History",
      "Modern Art",
      "Digital Technology",
    ],
    quote: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    quoteAuthor: "Dr. Seuss — echoed in the halls of the British Library",
  },
};

export default function AvatarProfile() {
  const [, params] = useRoute("/avatars/:city");
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const city = (params?.city ?? "london") as CityKey;
  const cfg = CITY_CONFIGS[city] ?? CITY_CONFIGS.london;
  const avatar = t.avatars[city] ?? t.avatars.london;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container max-w-4xl">
          {/* Back */}
          <Link href="/avatars">
            <Button variant="ghost" size="sm" className="gap-2 mb-8 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              All Avatars
            </Button>
          </Link>

          {/* Hero card */}
          <div className={`glass-card rounded-3xl overflow-hidden border-2 ${cfg.borderClass} relative mb-8`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient}`} />

            <div className="relative z-10 p-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar visual */}
                <div className="flex-shrink-0">
                  <div
                    className="w-36 h-36 rounded-full flex items-center justify-center text-6xl relative"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${cfg.color}30, ${cfg.color}05)`,
                      border: `3px solid ${cfg.color}40`,
                      boxShadow: `0 0 60px ${cfg.color}20`,
                    }}
                  >
                    {cfg.emoji}
                    <div
                      className="absolute inset-0 rounded-full border-2 border-dashed opacity-20 float-animation"
                      style={{ borderColor: cfg.color, transform: "scale(1.15)" }}
                    />
                  </div>
                  <div className="text-center mt-3 text-3xl">{cfg.flag}</div>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                    <MapPin className={`w-4 h-4 ${cfg.accentClass}`} />
                    <span className={`text-xs font-bold tracking-widest uppercase ${cfg.accentClass}`}>
                      City Avatar
                    </span>
                  </div>
                  <h1
                    className={`text-5xl font-black tracking-widest mb-2 ${cfg.accentClass}`}
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {avatar.name}
                  </h1>
                  <p className="text-xl text-muted-foreground font-light italic mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    "{avatar.title}"
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-6 max-w-lg">
                    {avatar.bio}
                  </p>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Sparkles className={`w-4 h-4 ${cfg.accentClass}`} />
                    <span className={`text-sm font-semibold ${cfg.accentClass}`}>{avatar.specialty}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quote */}
          <div className={`glass-card rounded-2xl p-8 border ${cfg.borderClass}/40 mb-8 relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-1 h-full`} style={{ background: cfg.color }} />
            <blockquote className="pl-6">
              <p className="text-lg italic text-foreground/80 leading-relaxed mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                "{cfg.quote}"
              </p>
              <cite className={`text-sm ${cfg.accentClass} font-medium not-italic`}>
                — {cfg.quoteAuthor}
              </cite>
            </blockquote>
          </div>

          {/* Knowledge domains */}
          <div className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Brain className={`w-5 h-5 ${cfg.accentClass}`} />
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Knowledge Domains
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {cfg.knowledge.map((domain) => (
                <div
                  key={domain}
                  className={`p-3 rounded-xl ${cfg.bgClass} border ${cfg.borderClass}/30 text-center`}
                >
                  <span className="text-sm font-medium text-foreground/80">{domain}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trilingual identity */}
          <div className="glass-card rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Globe className={`w-5 h-5 ${cfg.accentClass}`} />
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Trilingual Identity
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { lang: "en", label: "English", title: t.avatars[city]?.title, bio: t.avatars[city]?.bio.slice(0, 120) + "..." },
                { lang: "de", label: "Deutsch", title: t.avatars.berlin.title, bio: "Jeder Avatar wird in drei Sprachen vollständig verkörpert — nicht übersetzt, sondern nativ ausgedrückt." },
                { lang: "ru", label: "Русский", title: t.avatars.moscow.title, bio: "Каждый аватар полностью воплощён на трёх языках — не переведён, а нативно выражен." },
              ].map(({ lang, label, title, bio }) => (
                <div key={lang} className={`p-4 rounded-xl ${cfg.bgClass} border ${cfg.borderClass}/30`}>
                  <span className={`lang-badge lang-${lang} mb-3 inline-block`}>{lang.toUpperCase()}</span>
                  <p className="text-xs font-semibold text-foreground/70 mb-2">{label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{bio}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className={`glass-card rounded-2xl p-8 border-2 ${cfg.borderClass} text-center relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-50`} />
            <div className="relative z-10">
              <Zap className={`w-8 h-8 ${cfg.accentClass} mx-auto mb-4`} />
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Generate with {avatar.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Channel the intellectual power of {avatar.name} to generate unlimited knowledge across all domains and three languages.
              </p>
              {isAuthenticated ? (
                <Link href="/generate">
                  <Button
                    className="gap-2 font-bold"
                    style={{ background: cfg.color, color: "oklch(0.08 0.01 260)" }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Start Generating
                  </Button>
                </Link>
              ) : (
                <Button
                  className="gap-2 font-bold"
                  style={{ background: cfg.color, color: "oklch(0.08 0.01 260)" }}
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  <Sparkles className="w-4 h-4" />
                  Sign In to Generate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
