import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Menu, X, Sparkles, BookOpen, Clock, Users, Home } from "lucide-react";

const LANG_LABELS: Record<Language, string> = {
  en: "EN",
  de: "DE",
  ru: "RU",
};

const LANG_FULL: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
  ru: "Русский",
};

export default function Navigation() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/generate", label: t.nav.generate, icon: Sparkles },
    { href: "/avatars", label: t.nav.avatars, icon: Users },
    { href: "/repository", label: t.nav.repository, icon: BookOpen },
    { href: "/history", label: t.nav.history, icon: Clock },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-lg p2p-gradient flex items-center justify-center pulse-glow">
              <span className="text-black font-black text-sm font-mono">P2</span>
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="p2p-gradient-text">Prize2Pride</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  location === href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <Globe className="w-4 h-4" />
                  <span className="font-semibold text-xs tracking-wider">{LANG_LABELS[language]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border">
                {(["en", "de", "ru"] as Language[]).map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`gap-2 cursor-pointer ${language === lang ? "text-primary" : ""}`}
                  >
                    <span className={`lang-badge lang-${lang}`}>{LANG_LABELS[lang]}</span>
                    <span>{LANG_FULL[lang]}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-card/50 rounded-lg p-1 border border-border/30">
              {Object.entries(LANG_LABELS).map(([lang, label]) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang as Language)}
                  className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                    language === lang
                      ? "bg-primary text-black"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={LANG_FULL[lang as Language]}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/40 py-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  location === href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
