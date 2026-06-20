import { useLanguage } from "@/contexts/LanguageContext";

import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Globe, BookOpen, Zap, ArrowRight, Brain, Layers, Languages } from "lucide-react";

const CITY_CONFIGS = {
  berlin: {
    color: "berlin",
    gradient: "from-blue-500/20 to-blue-900/5",
    border: "berlin-border",
    bg: "berlin-bg",
    accent: "berlin-accent",
    emoji: "🏛️",
    flag: "🇩🇪",
  },
  moscow: {
    color: "moscow",
    gradient: "from-red-500/20 to-red-900/5",
    border: "moscow-border",
    bg: "moscow-bg",
    accent: "moscow-accent",
    emoji: "⭐",
    flag: "🇷🇺",
  },
  london: {
    color: "london",
    gradient: "from-amber-500/20 to-amber-900/5",
    border: "london-border",
    bg: "london-bg",
    accent: "london-accent",
    emoji: "👑",
    flag: "🇬🇧",
  },
};

export default function Home() {
  const { t, language } = useLanguage();

  const cities = ["berlin", "moscow", "london"] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-40 right-1/4 w-64 h-64 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(oklch(0.78 0.12 75) 1px, transparent 1px), linear-gradient(90deg, oklch(0.78 0.12 75) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trilingual AI Knowledge Platform</span>
              <span className="flex gap-1 ml-1">
                <span className="lang-badge lang-en">EN</span>
                <span className="lang-badge lang-de">DE</span>
                <span className="lang-badge lang-ru">RU</span>
              </span>
            </div>

            {/* Main title */}
            <h1 className="text-6xl md:text-8xl font-black mb-6 leading-none tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="p2p-gradient-text">Prize</span>
              <span className="text-foreground">2</span>
              <span className="p2p-gradient-text">Pride</span>
            </h1>

            {/* Tagline */}
            <p className="text-xl md:text-2xl text-muted-foreground font-light mb-4 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {t.hero.tagline}
            </p>

            {/* Subtitle */}
            <p className="text-base text-muted-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/generate">
                <Button size="lg" className="p2p-gradient text-black font-bold px-8 h-12 hover:opacity-90 transition-opacity gap-2">
                  <Sparkles className="w-4 h-4" />
                  {t.hero.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/repository">
                <Button size="lg" variant="outline" className="px-8 h-12 border-border hover:bg-accent gap-2">
                  <BookOpen className="w-4 h-4" />
                  {t.hero.ctaSecondary}
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-8 mt-14 pt-10 border-t border-border/40">
              {[
                { label: "Languages", value: "3", sub: "EN · DE · RU" },
                { label: "City Avatars", value: "3", sub: "Berlin · Moscow · London" },
                { label: "Output Formats", value: "5+", sub: "Text · Science · Art · Song" },
                { label: "Knowledge Limit", value: "∞", sub: "Unlimited depth" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="text-center hidden sm:block">
                  <div className="text-3xl font-black p2p-gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                  <div className="text-xs text-muted-foreground/50">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Avatar Showcase */}
      <section className="py-20 border-t border-border/40">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Three Cities. Three Minds. One Platform.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Each avatar embodies the intellectual spirit of its city — distinct, powerful, and augmented for the age of transcendent knowledge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cities.map((city) => {
              const cfg = CITY_CONFIGS[city];
              const avatar = t.avatars[city];
              return (
                <Link key={city} href={`/avatars/${city}`}>
                  <div className={`glass-card rounded-2xl p-8 cursor-pointer group hover:scale-[1.02] transition-all duration-300 border-2 ${cfg.border} relative overflow-hidden`}>
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-50`} />

                    <div className="relative z-10">
                      {/* City icon */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-14 h-14 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center text-2xl`}>
                          {cfg.emoji}
                        </div>
                        <div>
                          <div className={`text-xs font-bold tracking-widest ${cfg.accent} uppercase`}>
                            {cfg.flag} {avatar.name}
                          </div>
                          <div className="text-sm text-muted-foreground font-medium">{avatar.title}</div>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-4">
                        {avatar.bio}
                      </p>

                      {/* Specialty */}
                      <div className={`text-xs font-semibold ${cfg.accent} tracking-wider`}>
                        {avatar.specialty}
                      </div>

                      {/* Arrow */}
                      <div className={`mt-4 flex items-center gap-1 text-xs ${cfg.accent} font-medium group-hover:gap-2 transition-all`}>
                        Explore Avatar <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 border-t border-border/40">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              The Knowledge Engine
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature engineered for unlimited knowledge generation across all domains, all languages, all formats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Languages,
                title: "Simultaneous Trilingual Output",
                desc: "Every response is generated in English, German, and Russian simultaneously — not translated, but natively composed in each language.",
                color: "text-blue-400",
              },
              {
                icon: Brain,
                title: "Unlimited Knowledge Depth",
                desc: "Generate 1000+ lines of structured, comprehensive content on any scientific, creative, or cultural topic without restriction.",
                color: "text-primary",
              },
              {
                icon: Layers,
                title: "Multi-Format Generation",
                desc: "Long-form text, scientific papers, visual posters, creative works, and song lyrics — all within a single unified chat interface.",
                color: "text-red-400",
              },
              {
                icon: Sparkles,
                title: "AI Visual Generation",
                desc: "Generate scientific posters, avatar art, and branded visual content directly within the knowledge thread using state-of-the-art image AI.",
                color: "text-primary",
              },
              {
                icon: BookOpen,
                title: "Public Knowledge Repository",
                desc: "Contribute to a growing public archive of trilingual knowledge — searchable, shareable, and open to the world.",
                color: "text-blue-400",
              },
              {
                icon: Zap,
                title: "Session Persistence",
                desc: "Every generation session is saved to your profile, tied to your city avatar, and available for revisiting, downloading, or sharing.",
                color: "text-red-400",
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card rounded-xl p-6 hover:border-primary/30 transition-colors">
                <Icon className={`w-8 h-8 ${color} mb-4`} />
                <h3 className="font-bold text-base mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/40">
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden glass-card p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/5" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                <span className="p2p-gradient-text">Begin Your Knowledge Journey</span>
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join Prize2Pride and start generating unlimited knowledge across three languages. Your city avatar awaits.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/generate">
                  <Button size="lg" className="p2p-gradient text-black font-bold px-10 h-12 gap-2">
                    <Sparkles className="w-4 h-4" />
                    {t.hero.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded p2p-gradient flex items-center justify-center">
                <span className="text-black font-black text-xs font-mono">P2</span>
              </div>
              <span className="font-bold text-sm p2p-gradient-text" style={{ fontFamily: "'Playfair Display', serif" }}>Prize2Pride</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Berlin · Moscow · London</span>
              <span>·</span>
              <span>English · Deutsch · Русский</span>
              <span>·</span>
              <span>© 2300 Prize2Pride</span>
            </div>
            <div className="flex gap-3">
              <span className="lang-badge lang-en">EN</span>
              <span className="lang-badge lang-de">DE</span>
              <span className="lang-badge lang-ru">RU</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
