import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Generate from "./pages/Generate";
import Avatars from "./pages/Avatars";
import Repository from "./pages/Repository";
import History from "./pages/History";
import AvatarProfile from "./pages/AvatarProfile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/generate" component={Generate} />
      <Route path="/generate/:sessionId" component={Generate} />
      <Route path="/avatars" component={Avatars} />
      <Route path="/avatars/:city" component={AvatarProfile} />
      <Route path="/repository" component={Repository} />
      <Route path="/history" component={History} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
