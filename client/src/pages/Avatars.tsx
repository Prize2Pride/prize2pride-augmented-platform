import { Link } from "wouter";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Brain, Sparkles } from "lucide-react";

const CITY_DATA = {
  berlin: {
    color: "oklch(0.72 0.15 220)",
    borderClass: "berlin-border",
    bgClass: "berlin-bg",
    accentClass: "berlin-accent",
    flag: "🇩🇪",
    emoji: "🏛️",
    gradient: "from-blue-600/20 via-blue-900/10 to-transparent",
    stats: [
      { label: "Domain", value: "Science & Philosophy" },
      { label: "City", value: "Berlin, Germany" },
      { label: "Language", value: "Deutsch · English" },
      { label: "Era", value: "Enlightenment → 2300" },
    ],
    traits: ["Analytical Precision", "Philosophical Depth", "Scientific Rigor", "Systematic Thought"],
  },
  moscow: {
    color: "oklch(0.72 0.18 15)",
    borderClass: "moscow-border",
    bgClass: "moscow-bg",
    accentClass: "moscow-accent",
    flag: "🇷🇺",
    emoji: "⭐",
    gradient: "from-red-600/20 via-red-900/10 to-transparent",
    stats: [
      { label: "Domain", value: "Literature & Mathematics" },
      { label: "City", value: "Moscow, Russia" },
      { label: "Language", value: "Русский · English" },
      { label: "Era", value: "Imperial → 2300" },
    ],
    traits: ["Boundless Passion", "Mathematical Genius", "Literary Soul", "Revolutionary Spirit"],
  },
  london: {
    color: "oklch(0.78 0.12 75)",
    borderClass: "london-border",
    bgClass: "london-bg",
    accentClass: "london-accent",
    flag: "🇬🇧",
    emoji: "👑",
    gradient: "from-amber-500/20 via-amber-900/10 to-transparent",
    stats: [
      { label: "Domain", value: "Innovation & Culture" },
      { label: "City", value: "London, United Kingdom" },
      { label: "Language", value: "English · All" },
      { label: "Era", value: "Renaissance → 2300" },
    ],
    traits: ["Global Synthesis", "Cultural Bridge", "Innovative Vision", "Pragmatic Wisdom"],
  },
};

export default function Avatars() {
  const { t } = useLanguage();
  const cities = ["berlin", "moscow", "london"] as const;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
              <Brain className="w-3.5 h-3.5" />
              Three Augmented Minds
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              The <span className="p2p-gradient-text">City Avatars</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Three cities. Three intellectual traditions. Three augmented personas — each embodying the knowledge spirit of their city, transcended into the age of Prize2Pride.
            </p>
          </div>

          {/* Avatar cards — large format */}
          <div className="space-y-8">
            {cities.map((city, idx) => {
              const cfg = CITY_DATA[city];
              const avatar = t.avatars[city];
              const isReverse = idx % 2 === 1;

              return (
                <div
                  key={city}
                  className={`glass-card rounded-3xl overflow-hidden border-2 ${cfg.borderClass} relative`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-40`} />

                  <div className={`relative z-10 grid grid-cols-1 md:grid-cols-2 gap-0 ${isReverse ? "md:grid-flow-dense" : ""}`}>
                    {/* Visual side */}
                    <div className={`p-10 flex flex-col items-center justify-center ${cfg.bgClass} border-b md:border-b-0 ${isReverse ? "md:border-l" : "md:border-r"} border-current/10`}>
                      {/* Avatar visual */}
                      <div className="relative mb-6">
                        <div
                          className="w-40 h-40 rounded-full flex items-center justify-center text-7xl relative"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, ${cfg.color}30, ${cfg.color}05)`,
                            border: `3px solid ${cfg.color}40`,
                            boxShadow: `0 0 60px ${cfg.color}20, 0 0 120px ${cfg.color}10`,
                          }}
                        >
                          {cfg.emoji}
                          {/* Orbit ring */}
                          <div
                            className="absolute inset-0 rounded-full border-2 border-dashed opacity-30 float-animation"
                            style={{ borderColor: cfg.color, transform: "scale(1.2)" }}
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 text-3xl">{cfg.flag}</div>
                      </div>

                      {/* City name */}
                      <h2
                        className={`text-4xl font-black tracking-widest mb-1 ${cfg.accentClass}`}
                        style={{ fontFamily: "'Space Mono', monospace" }}
                      >
                        {avatar.name}
                      </h2>
                      <p className="text-muted-foreground text-sm font-medium italic mb-6">
                        "{avatar.title}"
                      </p>

                      {/* Traits */}
                      <div className="flex flex-wrap gap-2 justify-center">
                        {cfg.traits.map((trait) => (
                          <span
                            key={trait}
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.bgClass} border ${cfg.borderClass}`}
                            style={{ color: cfg.color }}
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Content side */}
                    <div className={`p-10 ${isReverse ? "md:order-first" : ""}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className={`w-4 h-4 ${cfg.accentClass}`} />
                        <span className={`text-xs font-bold tracking-widest uppercase ${cfg.accentClass}`}>
                          {cfg.stats[1].value}
                        </span>
                      </div>

                      <p className="text-muted-foreground leading-relaxed mb-8 text-base">
                        {avatar.bio}
                      </p>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-3 mb-8">
                        {cfg.stats.map(({ label, value }) => (
                          <div key={label} className={`p-3 rounded-xl ${cfg.bgClass} border ${cfg.borderClass}/30`}>
                            <div className="text-xs text-muted-foreground mb-1">{label}</div>
                            <div className="text-sm font-semibold text-foreground">{value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Specialty */}
                      <div className="flex items-center gap-2 mb-6">
                        <Sparkles className={`w-4 h-4 ${cfg.accentClass}`} />
                        <span className={`text-sm font-semibold ${cfg.accentClass}`}>{avatar.specialty}</span>
                      </div>

                      <Link href={`/avatars/${city}`}>
                        <Button
                          className="gap-2 font-semibold"
                          style={{
                            background: `linear-gradient(135deg, ${cfg.color}20, ${cfg.color}10)`,
                            borderColor: `${cfg.color}40`,
                            color: cfg.color,
                          }}
                          variant="outline"
                        >
                          Explore {avatar.name} Avatar
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
