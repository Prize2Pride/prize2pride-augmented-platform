import { useState, useRef, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import {
  Sparkles, Plus, Download, Share2, Image as ImageIcon,
  FileText, FlaskConical, Palette, Music, Loader2,
  ChevronDown, ChevronUp, Globe, Copy, Check, Trash2,
  PanelLeftOpen, PanelLeftClose, Lock
} from "lucide-react";

type OutputType = "text" | "scientific" | "poster" | "creative" | "song";

interface GeneratedEntry {
  id?: number;
  prompt: string;
  outputType: OutputType;
  contentEn: string;
  contentDe: string;
  contentRu: string;
  imageUrl?: string;
  createdAt?: Date;
}

const FORMAT_ICONS: Record<OutputType, React.ElementType> = {
  text: FileText,
  scientific: FlaskConical,
  poster: Palette,
  creative: Sparkles,
  song: Music,
};

const FORMAT_COLORS: Record<OutputType, string> = {
  text: "text-blue-400",
  scientific: "text-green-400",
  poster: "text-primary",
  creative: "text-purple-400",
  song: "text-pink-400",
};

function TrilingualBlock({ entry, expandedLangs, toggleLang }: {
  entry: GeneratedEntry;
  expandedLangs: Set<string>;
  toggleLang: (key: string) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyContent = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadContent = (content: string, lang: string, prompt: string) => {
    const blob = new Blob([`# Prize2Pride Knowledge\n## Prompt: ${prompt}\n## Language: ${lang}\n\n${content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prize2pride-${lang}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const langs = [
    { key: "en", label: "English", content: entry.contentEn, badge: "lang-en" },
    { key: "de", label: "Deutsch", content: entry.contentDe, badge: "lang-de" },
    { key: "ru", label: "Русский", content: entry.contentRu, badge: "lang-ru" },
  ];

  return (
    <div className="space-y-3">
      {/* Image if present */}
      {entry.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-border/40">
          <img src={entry.imageUrl} alt="Generated visual" className="w-full object-cover max-h-96" />
          <div className="flex items-center justify-between px-3 py-2 bg-card/50 border-t border-border/40">
            <span className="text-xs text-muted-foreground">AI-Generated Visual</span>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => window.open(entry.imageUrl, "_blank")}>
              <Download className="w-3 h-3" /> Download
            </Button>
          </div>
        </div>
      )}

      {/* Trilingual content blocks */}
      {langs.map(({ key, label, content, badge }) => {
        if (!content) return null;
        const blockKey = `${entry.prompt}-${key}`;
        const isExpanded = expandedLangs.has(blockKey);
        const preview = content.slice(0, 400);

        return (
          <div key={key} className="rounded-xl border border-border/40 overflow-hidden bg-card/30">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-card/50 border-b border-border/40">
              <div className="flex items-center gap-2">
                <span className={`lang-badge ${badge}`}>{key.toUpperCase()}</span>
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <Globe className="w-3 h-3 text-muted-foreground/50" />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm" variant="ghost" className="h-6 w-6 p-0"
                  onClick={() => copyContent(content, blockKey)}
                >
                  {copied === blockKey ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                </Button>
                <Button
                  size="sm" variant="ghost" className="h-6 w-6 p-0"
                  onClick={() => downloadContent(content, label, entry.prompt)}
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  size="sm" variant="ghost" className="h-6 w-6 p-0"
                  onClick={() => toggleLang(blockKey)}
                >
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-3">
              {isExpanded ? (
                <div className="prose prose-invert prose-sm max-w-none text-foreground/90 [&_h1]:text-primary [&_h2]:text-primary/80 [&_h3]:text-primary/70 [&_code]:text-primary [&_strong]:text-foreground">
                  <Streamdown>{content}</Streamdown>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{preview}{content.length > 400 ? "..." : ""}</p>
                  {content.length > 400 && (
                    <Button
                      size="sm" variant="ghost" className="mt-2 h-7 text-xs text-primary gap-1"
                      onClick={() => toggleLang(blockKey)}
                    >
                      <ChevronDown className="w-3 h-3" />
                      Show full content ({Math.round(content.length / 5)} words)
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Generate() {
  const [, params] = useRoute("/generate/:sessionId");
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();

  const [prompt, setPrompt] = useState("");
  const [outputType, setOutputType] = useState<OutputType>("text");
  const [generateVisual, setGenerateVisual] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(
    params?.sessionId ? parseInt(params.sessionId) : null
  );
  const [entries, setEntries] = useState<GeneratedEntry[]>([]);
  const [expandedLangs, setExpandedLangs] = useState<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();
  const createSession = trpc.knowledge.createSession.useMutation();
  const generateMutation = trpc.knowledge.generate.useMutation();
  const sessionsQuery = trpc.knowledge.getSessions.useQuery(undefined, { enabled: isAuthenticated });
  const sessionEntriesQuery = trpc.knowledge.getSessionEntries.useQuery(
    { sessionId: currentSessionId! },
    { enabled: !!currentSessionId && isAuthenticated }
  );

  // Load existing session entries
  useEffect(() => {
    if (sessionEntriesQuery.data) {
      const mapped: GeneratedEntry[] = sessionEntriesQuery.data.map((e) => ({
        id: e.id,
        prompt: e.prompt,
        outputType: e.outputType as OutputType,
        contentEn: e.contentEn ?? "",
        contentDe: e.contentDe ?? "",
        contentRu: e.contentRu ?? "",
        imageUrl: e.imageUrl ?? undefined,
        createdAt: e.createdAt,
      }));
      setEntries(mapped);
    }
  }, [sessionEntriesQuery.data]);

  // Scroll to bottom on new entry
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  const toggleLang = useCallback((key: string) => {
    setExpandedLangs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    let sessionId = currentSessionId;

    // Create session if needed
    if (!sessionId) {
      try {
        const session = await createSession.mutateAsync({ title: prompt.slice(0, 80) });
        if (session) {
          sessionId = session.id;
          setCurrentSessionId(sessionId);
          navigate(`/generate/${sessionId}`);
        }
      } catch {
        toast.error("Failed to create session");
        return;
      }
    }

    if (!sessionId) return;

    const currentPrompt = prompt;
    setPrompt("");

    // Optimistic entry
    const optimisticEntry: GeneratedEntry = {
      prompt: currentPrompt,
      outputType,
      contentEn: "",
      contentDe: "",
      contentRu: "",
    };
    setEntries((prev) => [...prev, optimisticEntry]);

    try {
      const result = await generateMutation.mutateAsync({
        sessionId,
        prompt: currentPrompt,
        outputType,
        generateImage: generateVisual,
      });

      // Replace optimistic with real
      setEntries((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          prompt: currentPrompt,
          outputType,
          contentEn: result.contentEn ?? "",
          contentDe: result.contentDe ?? "",
          contentRu: result.contentRu ?? "",
          imageUrl: result.imageUrl ?? undefined,
        };
        return updated;
      });

      // Auto-expand all language blocks for the new entry
      const keys = ["en", "de", "ru"].map((k) => `${currentPrompt}-${k}`);
      setExpandedLangs((prev) => {
        const next = new Set(prev);
        keys.forEach((k) => next.add(k));
        return next;
      });

      utils.knowledge.getSessions.invalidate();
    } catch (err) {
      toast.error("Generation failed. Please try again.");
      setEntries((prev) => prev.slice(0, -1));
    }
  };

  const handleNewSession = async () => {
    setCurrentSessionId(null);
    setEntries([]);
    navigate("/generate");
  };

  const isGenerating = generateMutation.isPending || createSession.isPending;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center glass-card rounded-2xl p-12 max-w-md mx-4">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Sign In to Generate
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Access the Prize2Pride Knowledge Engine — generate unlimited trilingual knowledge across all formats.
            </p>
            <Button
              className="p2p-gradient text-black font-bold w-full"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Sign In to Prize2Pride
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex flex-1 pt-16 overflow-hidden h-screen">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 border-r border-border/40 flex flex-col bg-sidebar hidden md:flex overflow-hidden">
            <div className="p-4 border-b border-border/40 flex items-center justify-between">
              <span className="text-sm font-semibold text-sidebar-foreground">Sessions</span>
              <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={handleNewSession}>
                <Plus className="w-3 h-3" /> {t.generate.newSession}
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {sessionsQuery.data?.map((session) => (
                <button
                  key={session.id}
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    navigate(`/generate/${session.id}`);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                    currentSessionId === session.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  <div className="font-medium truncate">{session.title}</div>
                  <div className="text-muted-foreground/50 mt-0.5">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
              {!sessionsQuery.data?.length && (
                <p className="text-xs text-muted-foreground/50 px-3 py-4 text-center">
                  No sessions yet
                </p>
              )}
            </div>
          </aside>
        )}

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="border-b border-border/40 px-4 py-3 flex items-center gap-3 bg-card/20">
            <Button
              variant="ghost" size="sm" className="h-8 w-8 p-0 hidden md:flex"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
            <div className="flex-1">
              <h1 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t.generate.title}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="lang-badge lang-en">EN</span>
                <span className="lang-badge lang-de">DE</span>
                <span className="lang-badge lang-ru">RU</span>
                <span className="text-xs text-muted-foreground/50">· Simultaneous trilingual output</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-1 text-xs" onClick={handleNewSession}>
              <Plus className="w-3 h-3" /> New
            </Button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {entries.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-lg">
                  <div className="w-16 h-16 rounded-2xl p2p-gradient mx-auto mb-6 flex items-center justify-center pulse-glow">
                    <Sparkles className="w-8 h-8 text-black" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    <span className="p2p-gradient-text">Prize2Pride</span> Knowledge Engine
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    Enter any topic, question, or concept below. Receive comprehensive knowledge simultaneously in English, German, and Russian.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground/60">
                    {["Quantum mechanics", "Die Philosophie Hegels", "Теория относительности", "Renaissance art history"].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setPrompt(ex)}
                        className="px-3 py-2 rounded-lg border border-border/40 hover:border-primary/30 hover:text-primary transition-colors text-left"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {entries.map((entry, idx) => {
              const FormatIcon = FORMAT_ICONS[entry.outputType];
              const isLoading = idx === entries.length - 1 && isGenerating;

              return (
                <div key={idx} className="space-y-3">
                  {/* User prompt bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-2xl bg-primary/10 border border-primary/20 rounded-2xl rounded-tr-sm px-4 py-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FormatIcon className={`w-3.5 h-3.5 ${FORMAT_COLORS[entry.outputType]}`} />
                        <span className="text-xs text-muted-foreground capitalize">{entry.outputType}</span>
                      </div>
                      <p className="text-sm text-foreground">{entry.prompt}</p>
                    </div>
                  </div>

                  {/* AI response */}
                  <div className="flex justify-start">
                    <div className="max-w-4xl w-full">
                      <div className="flex items-center gap-2 mb-2 ml-1">
                        <div className="w-6 h-6 rounded p2p-gradient flex items-center justify-center">
                          <span className="text-black font-black text-xs">P2</span>
                        </div>
                        <span className="text-xs font-semibold p2p-gradient-text">Prize2Pride Engine</span>
                        {isLoading && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {t.generate.generating}
                          </div>
                        )}
                      </div>

                      {isLoading ? (
                        <div className="space-y-3">
                          {["en", "de", "ru"].map((lang) => (
                            <div key={lang} className="rounded-xl border border-border/40 overflow-hidden">
                              <div className="flex items-center gap-2 px-4 py-2.5 bg-card/50 border-b border-border/40">
                                <span className={`lang-badge lang-${lang}`}>{lang.toUpperCase()}</span>
                                <div className="h-2 w-24 bg-border/40 rounded shimmer" />
                              </div>
                              <div className="px-4 py-3 space-y-2">
                                <div className="h-2 bg-border/30 rounded shimmer w-full" />
                                <div className="h-2 bg-border/30 rounded shimmer w-4/5" />
                                <div className="h-2 bg-border/30 rounded shimmer w-3/4" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <TrilingualBlock
                          entry={entry}
                          expandedLangs={expandedLangs}
                          toggleLang={toggleLang}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-border/40 p-4 bg-card/20">
            {/* Format selector */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {(["text", "scientific", "poster", "creative", "song"] as OutputType[]).map((type) => {
                const Icon = FORMAT_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => setOutputType(type)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      outputType === type
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {t.generate.formats[type]}
                  </button>
                );
              })}
              <button
                onClick={() => setGenerateVisual(!generateVisual)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ml-auto ${
                  generateVisual
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                {t.generate.imageToggle}
              </button>
            </div>

            {/* Prompt input */}
            <div className="flex gap-3">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t.generate.placeholder}
                className="flex-1 min-h-[80px] max-h-48 resize-none bg-input border-border/60 focus:border-primary/50 text-sm placeholder:text-muted-foreground/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleGenerate();
                }}
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="p2p-gradient text-black font-bold h-auto px-6 self-end gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span className="hidden sm:block">{t.generate.submit}</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/40 mt-2">
              Ctrl+Enter to generate · Responses appear simultaneously in EN, DE, RU
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
