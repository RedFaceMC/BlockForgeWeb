import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import {
  AboutPage,
  AuthPage,
  CatalogPage,
  CreatorStudioPage,
  HomePage,
  ProjectPageLive,
  CreatorProfilePage,
} from "./pages/BlockForge";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/discover" component={() => <CatalogPage />} />
      <Route path="/search" component={() => <CatalogPage />} />
      <Route path="/mods" component={() => <CatalogPage category="mod" />} />
      <Route path="/plugins" component={() => <CatalogPage category="plugin" />} />
      <Route path="/resource-packs" component={() => <CatalogPage category="resourcepack" />} />
      <Route path="/modpacks" component={() => <CatalogPage category="modpack" />} />
      <Route path="/maps" component={() => <CatalogPage category="map" />} />
      <Route path="/shaders" component={() => <CatalogPage category="shader" />} />
      <Route path="/datapacks" component={() => <CatalogPage category="datapack" />} />
      <Route path="/project/:id" component={ProjectPageLive} />
      <Route path="/creator/:id" component={CreatorProfilePage} />
      <Route path="/creator-studio" component={CreatorStudioPage} />
      <Route path="/sign-in" component={() => <AuthPage mode="signin" />} />
      <Route path="/sign-up" component={() => <AuthPage mode="signup" />} />
      <Route path="/about" component={AboutPage} />
      <Route path="/help" component={AboutPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
