import { useState } from "react";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Globe, FileText, FlaskConical, Palette, Music, Sparkles,
  ChevronDown, ChevronUp, Copy, Check, Download, Loader2
} from "lucide-react";

const FORMAT_ICONS: Record<string, React.ElementType> = {
  text: FileText,
  scientific: FlaskConical,
  poster: Palette,
  creative: Sparkles,
  song: Music,
};

const FORMAT_COLORS: Record<string, string> = {
  text: "text-blue-400",
  scientific: "text-green-400",
  poster: "text-primary",
  creative: "text-purple-400",
  song: "text-pink-400",
};

export default function Repository() {
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedLang, setExpandedLang] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { data: entries, isLoading } = trpc.knowledge.getPublicRepository.useQuery({ limit: 100 });

  const copyContent = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadContent = (entry: { prompt: string; contentEn?: string | null; contentDe?: string | null; contentRu?: string | null }) => {
    const content = `# Prize2Pride Knowledge Repository\n## Prompt: ${entry.prompt}\n\n### English\n${entry.contentEn ?? ""}\n\n### Deutsch\n${entry.contentDe ?? ""}\n\n### Русский\n${entry.contentRu ?? ""}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prize2pride-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-6">
              <BookOpen className="w-3.5 h-3.5" />
              Public Knowledge Archive
            </div>
            <h1 className="text-5xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="p2p-gradient-text">{t.repository.title}</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t.repository.subtitle}
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="lang-badge lang-en">EN</span>
              <span className="lang-badge lang-de">DE</span>
              <span className="lang-badge lang-ru">RU</span>
              <span className="text-xs text-muted-foreground/50">· All entries trilingual</span>
            </div>
          </div>

          {/* Entries */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !entries?.length ? (
            <div className="text-center py-20">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">{t.repository.empty}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry) => {
                const FormatIcon = FORMAT_ICONS[entry.outputType] ?? FileText;
                const isExpanded = expandedId === entry.id;

                return (
                  <div key={entry.id} className="glass-card rounded-2xl overflow-hidden border border-border/40 hover:border-primary/20 transition-colors">
                    {/* Entry header */}
                    <div
                      className="flex items-center justify-between p-5 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <FormatIcon className={`w-4 h-4 ${FORMAT_COLORS[entry.outputType] ?? "text-primary"}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{entry.prompt}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground capitalize">{entry.outputType}</span>
                            <span className="text-muted-foreground/30">·</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-muted-foreground/30">·</span>
                            <Globe className="w-3 h-3 text-muted-foreground/50" />
                            <span className="lang-badge lang-en">EN</span>
                            <span className="lang-badge lang-de">DE</span>
                            <span className="lang-badge lang-ru">RU</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm" variant="ghost" className="h-8 w-8 p-0"
                          onClick={(e) => { e.stopPropagation(); downloadContent(entry); }}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="border-t border-border/40 p-5 space-y-4">
                        {/* Image */}
                        {entry.imageUrl && (
                          <div className="rounded-xl overflow-hidden border border-border/40">
                            <img src={entry.imageUrl} alt="Generated visual" className="w-full object-cover max-h-72" />
                          </div>
                        )}

                        {/* Language blocks */}
                        {[
                          { key: "en", label: "English", content: entry.contentEn, badge: "lang-en" },
                          { key: "de", label: "Deutsch", content: entry.contentDe, badge: "lang-de" },
                          { key: "ru", label: "Русский", content: entry.contentRu, badge: "lang-ru" },
                        ].map(({ key, label, content, badge }) => {
                          if (!content) return null;
                          const langKey = `${entry.id}-${key}`;
                          const isLangExpanded = expandedLang === langKey;

                          return (
                            <div key={key} className="rounded-xl border border-border/40 overflow-hidden">
                              <div className="flex items-center justify-between px-4 py-2.5 bg-card/50 border-b border-border/40">
                                <div className="flex items-center gap-2">
                                  <span className={`lang-badge ${badge}`}>{key.toUpperCase()}</span>
                                  <span className="text-xs text-muted-foreground">{label}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm" variant="ghost" className="h-6 w-6 p-0"
                                    onClick={() => copyContent(content, langKey)}
                                  >
                                    {copied === langKey ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                  </Button>
                                  <Button
                                    size="sm" variant="ghost" className="h-6 w-6 p-0"
                                    onClick={() => setExpandedLang(isLangExpanded ? null : langKey)}
                                  >
                                    {isLangExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  </Button>
                                </div>
                              </div>
                              <div className="px-4 py-3">
                                {isLangExpanded ? (
                                  <div className="prose prose-invert prose-sm max-w-none text-foreground/90 [&_h1]:text-primary [&_h2]:text-primary/80 [&_strong]:text-foreground">
                                    <Streamdown>{content}</Streamdown>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                                      {content.slice(0, 300)}{content.length > 300 ? "..." : ""}
                                    </p>
                                    {content.length > 300 && (
                                      <Button
                                        size="sm" variant="ghost" className="mt-1 h-7 text-xs text-primary gap-1"
                                        onClick={() => setExpandedLang(langKey)}
                                      >
                                        <ChevronDown className="w-3 h-3" />
                                        Read full content
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
