import { useEffect, useMemo, useState } from "react";
import * as React from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  Box,
  Check,
  ChevronRight,
  Download,
  ExternalLink,
  Heart,
  Layers3,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  UploadCloud,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const categories = [
  ["Mods", "mod", "/mods", "◇"],
  ["Plugins", "plugin", "/plugins", "▣"],
  ["Resource Packs", "resourcepack", "/resource-packs", "▤"],
  ["Modpacks", "modpack", "/modpacks", "▦"],
  ["Maps", "map", "/maps", "◈"],
  ["Shaders", "shader", "/shaders", "✦"],
  ["Datapacks", "datapack", "/datapacks", "⌁"],
] as const;

type Release = {
  id: string;
  name: string;
  version: string;
  date: string | null;
  changelog: string;
  gameVersions: string[];
  loaders: string[];
  downloads: number;
  files: { filename: string; url: string; primary?: boolean }[];
};

type Project = {
  id: string;
  title: string;
  slug?: string;
  description: string;
  category: string;
  icon?: string;
  downloads: number;
  author: string;
  source: "Modrinth" | "BlockForge" | "MinecraftMaps";
  sourceUrl: string;
  versions: string[];
  loaders: string[];
  tags: string[];
  gallery?: string[];
  releases?: Release[];
  featured?: boolean;
  accent: string;
};

const fallbackProjects: Project[] = [
  {
    id: "elemental-mastery",
    title: "Elemental Mastery",
    description: "A progression-driven elemental abilities plugin for survival servers and RPG worlds.",
    category: "plugin",
    downloads: 18400,
    author: "BlockForge showcase",
    source: "BlockForge",
    sourceUrl: "https://modrinth.com",
    versions: ["1.21", "1.20.6"],
    loaders: ["Paper", "Spigot"],
    tags: ["RPG", "Abilities", "Survival"],
    featured: true,
    accent: "#6ee7f9",
  },
  {
    id: "bountysmp",
    title: "BountySMP",
    description: "Turn every session into a living hunt with contracts, rewards, and server-wide rivalries.",
    category: "plugin",
    downloads: 9300,
    author: "BountySMP team",
    source: "BlockForge",
    sourceUrl: "https://modrinth.com",
    versions: ["1.21", "1.20.4"],
    loaders: ["Paper"],
    tags: ["SMP", "Quests", "Multiplayer"],
    accent: "#f5c97a",
  },
  {
    id: "redfacemc-pack",
    title: "RedFaceMC",
    description: "A crisp PvP texture pack with high-contrast particles and a warm nether-inspired palette.",
    category: "resourcepack",
    downloads: 27600,
    author: "RedFaceMC",
    source: "BlockForge",
    sourceUrl: "https://modrinth.com",
    versions: ["1.21", "1.20"],
    loaders: ["Resource Pack"],
    tags: ["PvP", "16x", "Low Fire"],
    accent: "#ff8b6a",
  },
  {
    id: "skybound-frontier",
    title: "Skybound Frontier",
    description: "A floating-islands survival map built for teams, exploration, and clean cinematic screenshots.",
    category: "map",
    downloads: 11200,
    author: "External map creator",
    source: "MinecraftMaps",
    sourceUrl: "https://www.minecraftmaps.com",
    versions: ["1.20", "1.19"],
    loaders: ["Java"],
    tags: ["Skyblock", "Adventure", "PvP"],
    accent: "#a9e3ff",
  },
];

const categoryLabel = (category: string) => categories.find((item) => item[1] === category)?.[0] ?? category;
const formatDownloads = (value: number) => (value > 999999 ? `${(value / 1000000).toFixed(1)}M` : value > 999 ? `${(value / 1000).toFixed(1)}K` : `${value}`);

function AmbientWorld() {
  const [pointer, setPointer] = useState({ x: 50, y: 35 });
  useEffect(() => {
    const onMove = (event: MouseEvent) => setPointer({ x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return <div className="ambient-world" aria-hidden="true" style={{ "--mx": `${pointer.x}%`, "--my": `${pointer.y}%` } as React.CSSProperties}><div className="ambient-glow" /><div className="terrain terrain-back" /><div className="terrain terrain-front" /><div className="ambient-dots">{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</div></div>;
}

function Logo() {
  return <Link href="/" className="brand"><span className="brand-mark"><Box size={19} strokeWidth={2.2} /></span><span>BLOCK<span className="brand-ice">FORGE</span></span></Link>;
}

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const nav = [["Discover", "/discover"], ["Mods", "/mods"], ["Plugins", "/plugins"], ["Resource Packs", "/resource-packs"], ["Maps", "/maps"]];
  return <header className="site-header"><div className="header-inner"><Logo /><nav className={mobileOpen ? "main-nav open" : "main-nav"}>{nav.map(([label, href]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)}>{label}</Link>)}<Link href="/creator-studio" className="studio-link" onClick={() => setMobileOpen(false)}><Sparkles size={14} /> Creator Studio</Link></nav><div className="header-actions"><Link href="/search" className="icon-link" aria-label="Search"><Search size={18} /></Link>{isAuthenticated ? <button className="user-chip" onClick={() => logout()} title="Sign out"><UserRound size={15} /> {user?.name?.split(" ")[0] ?? "Account"}</button> : <Button onClick={() => startLogin()} className="header-cta">Sign in <ArrowRight size={15} /></Button>}<button className="mobile-menu" aria-label="Toggle navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button></div></div></header>;
}

function Footer() { return <footer className="site-footer"><div className="container footer-grid"><div><Logo /><p className="footer-copy">A free, creator-first home for the worlds you build.</p><div className="free-stamp"><Check size={14} /> 100% FREE, ALWAYS</div></div><div><p className="footer-label">Explore</p><Link href="/discover">Discover projects</Link><Link href="/mods">Mods</Link><Link href="/plugins">Plugins</Link><Link href="/maps">Maps</Link></div><div><p className="footer-label">Build here</p><Link href="/creator-studio">Creator Studio</Link><Link href="/sign-up">Create an account</Link><Link href="/about">About BlockForge</Link><Link href="/help">Help center</Link></div></div><div className="container footer-bottom"><span>© 2026 BlockForge. Built for the community.</span><span>No paid listings. No checkout. No platform fees.</span></div></footer>; }

function Shell({ children }: { children: React.ReactNode }) { return <div className="app-shell"><AmbientWorld /><Header /><main className="page-content">{React.Children.toArray(children)}</main><Footer /></div>; }

function ProjectIcon({ project, large = false }: { project: Project; large?: boolean }) { return project.icon ? <img className={large ? "project-icon large" : "project-icon"} src={project.icon} alt="" /> : <div className={large ? "project-icon large icon-fallback" : "project-icon icon-fallback"} style={{ "--project-accent": project.accent } as React.CSSProperties}><Box size={large ? 31 : 22} /></div>; }

function ProjectCard({ project }: { project: Project }) { return <Link href={`/project/${project.id}`} className="project-card"><div className="project-card-top"><ProjectIcon project={project} /><span className="source-pill">{project.source === "BlockForge" ? "Showcase" : `External · ${project.source}`}</span></div><div className="project-card-title"><h3>{project.title}</h3><span className="chevron"><ChevronRight size={16} /></span></div><p>{project.description}</p><div className="tag-row">{project.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div><div className="project-card-meta"><span><Download size={14} /> {formatDownloads(project.downloads)}</span><span>{project.versions[0]}</span><span className="project-category">{categoryLabel(project.category)}</span></div></Link>; }

function Hero() { return <section className="hero container"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot" /> The free Minecraft marketplace</div><h1>Build your next<br /><span>block-level obsession.</span></h1><p>Discover, share, and shape the worlds that make Minecraft yours. No paid listings. No checkout. Just great community-made content.</p><div className="hero-actions"><Link href="/discover" className="primary-button">Explore the forge <ArrowRight size={17} /></Link><Link href="/creator-studio" className="secondary-button"><UploadCloud size={16} /> Share your work</Link></div><div className="hero-note"><ShieldCheck size={15} /> <span><strong>100% FREE</strong> for players and creators</span></div></div><div className="hero-art"><div className="hero-art-glow" /><div className="cube cube-one" /><div className="cube cube-two" /><div className="cube cube-three" /><div className="hero-art-panel"><div className="panel-topline"><span>BLOCKFORGE / DISCOVER</span><span className="live-dot">LIVE</span></div><div className="panel-word">MAKE<br /><span>MORE</span></div><div className="panel-footer"><span>mods · maps · magic</span><span>↗</span></div></div></div></section>; }

function CategoryRail() { return <section className="container category-section"><div className="section-heading"><div><span className="eyebrow">Choose your lane</span><h2>Forge something <em>new.</em></h2></div><Link href="/discover" className="text-link">View everything <ArrowRight size={15} /></Link></div><div className="category-grid">{categories.map(([label, value, href, icon]) => <Link href={href} className="category-tile" key={value}><span className="category-icon">{icon}</span><span>{label}</span><ArrowRight size={15} /></Link>)}</div></section>; }

function HomeContent() { const { data, isLoading } = trpc.discovery.search.useQuery({ query: "", category: "", limit: 4 }); const projects = (data?.projects?.length ? data.projects : fallbackProjects) as Project[]; return <Shell><><Hero /><CategoryRail /><section className="container showcase-section"><div className="section-heading"><div><span className="eyebrow">Community signal</span><h2>Fresh from the <em>forge.</em></h2></div><Link href="/discover" className="text-link">Open discovery <ArrowRight size={15} /></Link></div><div className="project-grid">{projects.map((project) => <ProjectCard project={project} key={project.id} />)}</div></section><section className="free-banner container"><div className="free-banner-icon"><Zap size={22} /></div><div><span className="eyebrow">The BlockForge promise</span><h2>100% FREE. <span>Zero friction.</span></h2><p>Creators keep their links, players keep their wallets. We keep the door open.</p></div><Link href="/about" className="secondary-button">Why free? <ArrowRight size={15} /></Link></section></></Shell>; }

export function HomePage() { return <HomeContent />; }

export function CatalogPage({ category = "" }: { category?: string }) { const [location] = useLocation(); const params = new URLSearchParams(location.split("?")[1] ?? ""); const initialQuery = params.get("q") ?? ""; const [query, setQuery] = useState(initialQuery); const [activeCategory, setActiveCategory] = useState(category); const { data, isLoading, error } = trpc.discovery.search.useQuery({ query, category: activeCategory, limit: 24 }); const projects = (data?.projects?.length ? data.projects : fallbackProjects.filter((project) => !activeCategory || project.category === activeCategory)) as Project[]; return <Shell><section className="catalog-head container"><div><span className="eyebrow">{activeCategory ? categoryLabel(activeCategory) : "Open discovery"}</span><h1>Find your next <span>favorite.</span></h1><p>Search real community projects and follow the trail to their official home.</p></div><div className="catalog-search"><Search size={18} /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search mods, maps, creators..." aria-label="Search projects" /></div></section><div className="container filter-row"><div className="filter-scroll"><button className={!activeCategory ? "filter active" : "filter"} onClick={() => setActiveCategory("")}>All</button>{categories.map(([label, value]) => <button key={value} className={activeCategory === value ? "filter active" : "filter"} onClick={() => setActiveCategory(value)}>{label}</button>)}</div><span className="result-count">{data?.total ?? projects.length} projects</span></div><section className="container catalog-grid">{error ? <div className="state-card"><TerminalSquare size={26} /><h3>Discovery is resting</h3><p>We couldn't reach Modrinth right now. The local showcase remains available while the connection comes back.</p></div> : isLoading ? Array.from({ length: 8 }, (_, i) => <div className="project-skeleton" key={i} />) : projects.length ? projects.map((project) => <ProjectCard project={project} key={project.id} />) : <div className="state-card"><Search size={26} /><h3>No projects found</h3><p>Try a wider search or clear the filters to explore the full forge.</p></div>}</section></Shell>; }

export function ProjectPage() { const [, params] = useRoute("/project/:id"); const projectId = params?.id ?? "elemental-mastery"; const { data, isLoading } = trpc.discovery.project.useQuery({ id: projectId }); const fallback = fallbackProjects.find((project) => project.id === projectId) ?? fallbackProjects[0]; const project = (data?.project ?? fallback) as Project; const [favorite, setFavorite] = useState(false); return <Shell><section className="container detail-page"><Link href="/discover" className="back-link">← Back to discovery</Link><div className="detail-hero"><ProjectIcon project={project} large /><div className="detail-heading"><div className="detail-kicker"><span>{categoryLabel(project.category)}</span><span className="source-pill">{project.source === "BlockForge" ? "BlockForge showcase" : `External project · ${project.source}`}</span></div><h1>{project.title}</h1><p>{project.description}</p><div className="detail-author">By <strong>{project.author}</strong> · {formatDownloads(project.downloads)} downloads</div></div><button className={favorite ? "favorite active" : "favorite"} onClick={() => setFavorite(!favorite)} aria-label="Favorite project"><Heart size={18} fill={favorite ? "currentColor" : "none"} /></button></div><div className="detail-actions"><a href={project.sourceUrl} target="_blank" rel="noreferrer" className="primary-button">Official project page <ExternalLink size={16} /></a><button className="secondary-button" onClick={() => toast.info("Downloads stay on the official project page.")}>Download <Download size={16} /></button></div><div className="detail-grid"><article className="detail-main"><div className="content-panel"><div className="panel-heading"><span>About this project</span><span className="panel-rule" /></div><p>{project.description} This listing is presented for discovery and attribution. Please review the official project page for licensing, supported versions, and the latest release before installing.</p><div className="tag-row large">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="content-panel"><div className="panel-heading"><span>Screenshots & changelog</span><span className="panel-rule" /></div><div className="screenshot-strip">{(project.gallery ?? []).length ? project.gallery?.map((image) => <img src={image} key={image} alt="Project screenshot" />) : <div className="safe-placeholder"><Layers3 size={22} /><span>Official screenshots appear on the linked project page.</span></div>}</div><p className="muted-copy">Last release notes and file history are maintained by the project owner on the official page.</p></div></article><aside className="detail-side"><div className="content-panel metadata-panel"><div className="panel-heading"><span>Project metadata</span><span className="panel-rule" /></div><dl><div><dt>Game versions</dt><dd>{project.versions.join(" · ")}</dd></div><div><dt>Loaders</dt><dd>{project.loaders.join(" · ")}</dd></div><div><dt>Downloads</dt><dd>{formatDownloads(project.downloads)}</dd></div><div><dt>Category</dt><dd>{categoryLabel(project.category)}</dd></div></dl></div><div className="attribution-card"><ShieldCheck size={19} /><div><strong>External project</strong><p>BlockForge does not claim ownership of this content. Follow the official link for licensing and support.</p></div></div></aside></div></section></Shell>; }

export function ProjectPageLive() { const [, params] = useRoute("/project/:id"); const projectId = params?.id ?? ""; const fallback = fallbackProjects.find((project) => project.id === projectId); const { data, isLoading, error } = trpc.discovery.project.useQuery({ id: projectId }, { enabled: Boolean(projectId) }); const { isAuthenticated } = useAuth(); const utils = trpc.useUtils(); const favoriteQuery = trpc.favorites.get.useQuery({ projectId, source: "Modrinth" }, { enabled: isAuthenticated && Boolean(projectId), retry: false }); const toggleFavorite = trpc.favorites.toggle.useMutation({ onSuccess: () => utils.favorites.get.invalidate({ projectId, source: "Modrinth" }), onError: (mutationError) => toast.error(mutationError.message || "Favorite could not be saved") }); if (isLoading && !fallback) return <Shell><div className="container state-page"><div className="project-skeleton tall" /></div></Shell>; if (error && !fallback) return <Shell><div className="container state-page"><div className="state-card"><TerminalSquare size={26} /><h3>Project details unavailable</h3><p>We couldn't reach the official project metadata right now. Try again soon or return to discovery.</p><Link href="/discover" className="secondary-button">Back to discovery <ArrowRight size={15} /></Link></div></div></Shell>; if (!data?.project && !fallback) return <Shell><div className="container state-page"><div className="state-card"><Search size={26} /><h3>Project not found</h3><p>This project is not available in the public discovery index.</p><Link href="/discover" className="secondary-button">Explore the forge <ArrowRight size={15} /></Link></div></div></Shell>; const project = (data?.project ?? fallback) as Project; const releases = data?.releases ?? project.releases ?? []; const favorite = favoriteQuery.data?.favorited ?? false; const onFavorite = () => { if (!isAuthenticated) { toast.info("Sign in to keep this project close."); startLogin(); return; } toggleFavorite.mutate({ projectId: project.id, source: project.source }); }; return <Shell><section className="container detail-page"><Link href="/discover" className="back-link">← Back to discovery</Link><div className="detail-hero"><ProjectIcon project={project} large /><div className="detail-heading"><div className="detail-kicker"><span>{categoryLabel(project.category)}</span><span className="source-pill">{project.source === "BlockForge" ? "BlockForge showcase" : `External project · ${project.source}`}</span></div><h1>{project.title}</h1><p>{project.description}</p><div className="detail-author">By <strong>{project.author}</strong> · {formatDownloads(project.downloads)} downloads</div></div><button className={favorite ? "favorite active" : "favorite"} onClick={onFavorite} aria-label={favorite ? "Remove favorite" : "Favorite project"}><Heart size={18} fill={favorite ? "currentColor" : "none"} /></button></div><div className="detail-actions"><a href={project.sourceUrl} target="_blank" rel="noreferrer" className="primary-button">Official project page <ExternalLink size={16} /></a><button className="secondary-button" onClick={() => toast.info("Downloads stay on the official project page.")}>Download <Download size={16} /></button></div><div className="detail-grid"><article className="detail-main"><div className="content-panel"><div className="panel-heading"><span>About this project</span><span className="panel-rule" /></div><p>{project.description} This listing is presented for discovery and attribution. Review the official project page for licensing, supported versions, and the latest release before installing.</p><div className="tag-row large">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="content-panel"><div className="panel-heading"><span>Screenshots</span><span className="panel-rule" /></div><div className="screenshot-strip">{(project.gallery ?? []).length ? project.gallery?.map((image) => <img src={image} key={image} alt={`${project.title} screenshot`} />) : <div className="safe-placeholder"><Layers3 size={22} /><span>Official screenshots appear on the linked project page.</span></div>}</div></div><div className="content-panel"><div className="panel-heading"><span>Latest changelog</span><span className="panel-rule" /></div>{releases.length ? <div className="release-list">{releases.slice(0, 3).map((release: Release) => <div className="release-item" key={release.id}><div className="release-head"><div><strong>{release.name}</strong><span>{release.version} · {release.date ? new Date(release.date).toLocaleDateString() : "Recent"}</span></div><span className="release-downloads"><Download size={12} /> {formatDownloads(release.downloads)}</span></div><p>{release.changelog}</p>{release.files[0] && <a href={release.files[0].url} target="_blank" rel="noreferrer" className="text-link">Official file: {release.files[0].filename} <ExternalLink size={13} /></a>}</div>)}</div> : <div className="safe-placeholder"><TerminalSquare size={22} /><span>No release notes were published yet. Check the official page for the latest changelog.</span></div>}</div></article><aside className="detail-side"><div className="content-panel metadata-panel"><div className="panel-heading"><span>Project metadata</span><span className="panel-rule" /></div><dl><div><dt>Game versions</dt><dd>{project.versions.join(" · ") || "See official page"}</dd></div><div><dt>Loaders</dt><dd>{project.loaders.join(" · ") || "See official page"}</dd></div><div><dt>Downloads</dt><dd>{formatDownloads(project.downloads)}</dd></div><div><dt>Category</dt><dd>{categoryLabel(project.category)}</dd></div></dl></div><div className="attribution-card"><ShieldCheck size={19} /><div><strong>External project</strong><p>BlockForge does not claim ownership of this content. Follow the official link for licensing and support.</p></div></div></aside></div></section></Shell>; }

export function CreatorStudioPage() { const { isAuthenticated, loading } = useAuth(); const [submitted, setSubmitted] = useState(false); const [screenshotKeys, setScreenshotKeys] = useState<string[]>([]); const uploadScreenshot = trpc.creator.uploadScreenshot.useMutation({ onSuccess: (stored) => setScreenshotKeys((keys) => [...keys, stored.key]), onError: (error) => toast.error(error.message || "Screenshot upload failed") }); const saveDraft = trpc.creator.saveDraft.useMutation({ onSuccess: () => setSubmitted(true), onError: (error) => toast.error(error.message || "Draft could not be saved") }); const handleScreenshots = (event: React.ChangeEvent<HTMLInputElement>) => { Array.from(event.target.files ?? []).forEach((file) => { const reader = new FileReader(); reader.onload = () => uploadScreenshot.mutate({ fileName: file.name, contentType: file.type, base64: String(reader.result ?? "") }); reader.readAsDataURL(file); }); }; if (loading) return <Shell><div className="container state-page"><div className="project-skeleton tall" /></div></Shell>; if (!isAuthenticated) return <Shell><section className="container auth-gate"><div className="auth-glyph"><Sparkles size={24} /></div><span className="eyebrow">Creator Studio</span><h1>Put your work<br /><span>on the shelf.</span></h1><p>Sign in to draft a project listing. Your files and metadata stay connected to your creator account.</p><Button onClick={() => startLogin()} className="primary-button">Sign in to continue <ArrowRight size={16} /></Button></section></Shell>; return <Shell><section className="container studio-page"><div className="studio-heading"><div><span className="eyebrow">Protected workspace</span><h1>Your creator <span>studio.</span></h1><p>Draft the next thing the community will discover. Publishing remains in your hands.</p></div><div className="free-stamp"><Check size={14} /> NO LISTING FEES</div></div><form className="studio-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); saveDraft.mutate({ name: String(form.get("name") ?? ""), description: String(form.get("description") ?? ""), category: String(form.get("category") ?? "mod"), versions: String(form.get("versions") ?? ""), loaders: String(form.get("loaders") ?? ""), changelog: String(form.get("changelog") ?? ""), downloadUrl: String(form.get("downloadUrl") || "") || undefined, screenshotKeys: screenshotKeys.join(",") }); }}><div className="form-card"><div className="panel-heading"><span>Project identity</span><span className="panel-rule" /></div><label>Project name<Input name="name" required placeholder="e.g. Lunar Frontier" /></label><label>Short description<Textarea name="description" required placeholder="What makes this project worth downloading?" /></label><div className="two-col"><label>Category<select name="category" defaultValue="mod"><option value="mod">Mod</option><option value="plugin">Plugin</option><option value="resourcepack">Resource Pack</option><option value="modpack">Modpack</option><option value="map">Map</option><option value="shader">Shader</option><option value="datapack">Datapack</option></select></label><label>Download link<Input name="downloadUrl" type="url" placeholder="https://..." /></label></div></div><div className="form-card"><div className="panel-heading"><span>Compatibility & release notes</span><span className="panel-rule" /></div><label>Game versions<Input name="versions" placeholder="1.21, 1.20.6" /></label><label>Loaders<Input name="loaders" placeholder="Fabric, Forge, Paper" /></label><label>Changelog<Textarea name="changelog" placeholder="What changed in this release?" /></label><div className="dropzone"><UploadCloud size={21} /><strong>Drop screenshots here</strong><span>{screenshotKeys.length ? `${screenshotKeys.length} screenshot${screenshotKeys.length === 1 ? "" : "s"} ready for this draft.` : "PNG, JPG, WEBP, or GIF · 8 MB max each"}</span><input className="file-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={handleScreenshots} /></div></div><div className="form-actions"><span className="muted-copy"><ShieldCheck size={14} /> Drafts are private until you publish.</span><Button type="submit" className="primary-button">Save draft <Check size={15} /></Button></div>{submitted && <div className="success-note"><Check size={16} /> Draft saved to your creator workspace. File uploads remain ready for S3-backed storage.</div>}</form></section></Shell>; }

export function CreatorProfilePage() { const [, params] = useRoute("/creator/:id"); const creatorId = params?.id ?? "blockforge-showcase"; const creatorProjects = fallbackProjects.filter((project) => project.author.toLowerCase().replace(/\s+/g, "-").includes(creatorId)); const projects = creatorProjects.length ? creatorProjects : fallbackProjects.slice(0, 2); const creatorName = creatorId === "redfacemc" ? "RedFaceMC" : creatorId === "bountysmp" ? "BountySMP team" : "BlockForge showcase"; return <Shell><section className="container about-page"><div className="about-hero"><span className="eyebrow">Creator profile</span><h1>{creatorName}<br /><span>keeps building.</span></h1><p>This profile collects attributed project entries and links back to the official project home. BlockForge does not claim ownership of external work.</p><div className="free-stamp"><Check size={14} /> CREATOR LINKS STAY CREATOR-OWNED</div></div><div className="section-heading"><div><span className="eyebrow">Published signal</span><h2>Projects in the <em>forge.</em></h2></div></div><div className="project-grid">{projects.map((project) => <ProjectCard project={project} key={project.id} />)}</div></section></Shell>; }

export function AuthPage({ mode }: { mode: "signin" | "signup" }) { const signup = mode === "signup"; return <Shell><section className="container auth-page"><div className="auth-card"><div className="auth-glyph"><Box size={24} /></div><span className="eyebrow">{signup ? "Join the forge" : "Welcome back"}</span><h1>{signup ? "Make space for" : "Pick up where"}<br /><span>{signup ? "your next build." : "you left off."}</span></h1><p>{signup ? "Create a free creator profile and start sharing with the community." : "Sign in to save favorites, manage drafts, and keep your creator profile close."}</p><Button onClick={() => startLogin()} className="primary-button auth-button">Continue with BlockForge <ArrowRight size={16} /></Button><p className="auth-disclaimer">Authentication is handled securely through the configured account provider.</p></div></section></Shell>; }

export function AboutPage() { return <Shell><section className="container about-page"><div className="about-hero"><span className="eyebrow">The BlockForge charter</span><h1>Open doors.<br /><span>Better worlds.</span></h1><p>BlockForge is a discovery layer for Minecraft creators and players. We make it easier to find the work worth your time, then point you back to the people who made it.</p></div><div className="about-grid"><div className="about-card"><Zap size={20} /><h3>100% FREE</h3><p>No paid listings, no checkout, no purchase fees, and no hidden platform tax.</p></div><div className="about-card"><ShieldCheck size={20} /><h3>Attribution first</h3><p>External work is labeled clearly and linked back to its official home for licensing and support.</p></div><div className="about-card"><UserRound size={20} /><h3>Creator-led</h3><p>Your project page, your release links, your audience. BlockForge is here to amplify, not own.</p></div></div><div className="help-panel"><div><span className="eyebrow">Need a hand?</span><h2>Start with the official link.</h2><p>For download issues, licensing questions, or project support, the creator's page is always the source of truth.</p></div><Link href="/discover" className="secondary-button">Browse projects <ArrowRight size={15} /></Link></div></section></Shell>; }
