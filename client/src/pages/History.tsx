import { useState } from "react";
import { Link, useLocation } from "wouter";
import Navigation from "@/components/Navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Clock, Plus, Trash2, Globe, Lock, Sparkles, Loader2,
  ArrowRight, ToggleLeft, ToggleRight
} from "lucide-react";

export default function History() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const sessionsQuery = trpc.knowledge.getSessions.useQuery(undefined, { enabled: isAuthenticated });
  const createSession = trpc.knowledge.createSession.useMutation();
  const deleteSession = trpc.knowledge.deleteSession.useMutation();
  const togglePublic = trpc.knowledge.toggleSessionPublic.useMutation();

  const handleNewSession = async () => {
    const session = await createSession.mutateAsync({ title: "New Session" });
    if (session) navigate(`/generate/${session.id}`);
  };

  const handleDelete = async (sessionId: number) => {
    setDeletingId(sessionId);
    try {
      await deleteSession.mutateAsync({ sessionId });
      utils.knowledge.getSessions.invalidate();
      toast.success("Session deleted");
    } catch {
      toast.error("Failed to delete session");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublic = async (sessionId: number, currentPublic: boolean) => {
    try {
      await togglePublic.mutateAsync({ sessionId, isPublic: !currentPublic });
      utils.knowledge.getSessions.invalidate();
      toast.success(currentPublic ? "Session set to private" : "Session made public");
    } catch {
      toast.error("Failed to update session");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center glass-card rounded-2xl p-12 max-w-md mx-4">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Sign In to View History
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Your knowledge generation history is tied to your Prize2Pride profile.
            </p>
            <Button
              className="p2p-gradient text-black font-bold w-full"
              onClick={() => window.location.href = getLoginUrl()}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-20">
        <div className="container max-w-3xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-primary" />
                <h1 className="text-3xl font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {t.history.title}
                </h1>
              </div>
              <p className="text-muted-foreground text-sm">
                {sessionsQuery.data?.length ?? 0} knowledge sessions
              </p>
            </div>
            <Button
              onClick={handleNewSession}
              disabled={createSession.isPending}
              className="p2p-gradient text-black font-bold gap-2"
            >
              {createSession.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {t.generate.newSession}
            </Button>
          </div>

          {/* Sessions list */}
          {sessionsQuery.isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : !sessionsQuery.data?.length ? (
            <div className="text-center py-20 glass-card rounded-2xl">
              <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{t.history.empty}</p>
              <Button onClick={handleNewSession} className="p2p-gradient text-black font-bold gap-2">
                <Plus className="w-4 h-4" />
                Start Generating
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionsQuery.data.map((session) => (
                <div
                  key={session.id}
                  className="glass-card rounded-xl p-5 border border-border/40 hover:border-primary/20 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate mb-1.5">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          <span className="lang-badge lang-en">EN</span>
                          <span className="lang-badge lang-de">DE</span>
                          <span className="lang-badge lang-ru">RU</span>
                        </div>
                        <span>·</span>
                        <span className={session.isPublic ? "text-green-400" : "text-muted-foreground/50"}>
                          {session.isPublic ? t.common.public : t.common.private}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Toggle public */}
                      <Button
                        size="sm" variant="ghost" className="h-8 w-8 p-0"
                        title={session.isPublic ? "Make private" : "Make public"}
                        onClick={() => handleTogglePublic(session.id, session.isPublic)}
                      >
                        {session.isPublic
                          ? <ToggleRight className="w-4 h-4 text-green-400" />
                          : <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                        }
                      </Button>

                      {/* Open session */}
                      <Link href={`/generate/${session.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 group-hover:text-primary transition-colors">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>

                      {/* Delete */}
                      <Button
                        size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-destructive transition-colors"
                        onClick={() => {
                          if (confirm(t.history.deleteConfirm)) handleDelete(session.id);
                        }}
                        disabled={deletingId === session.id}
                      >
                        {deletingId === session.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
