# Project TODO

- [x] Establish BlockForge obsidian-black, ice/cyan, warm sand, glass/stone, and pixel-border visual system
- [x] Add prominent 100% FREE messaging and remove all payment, checkout, listing-fee, and paid-product flows
- [x] Build responsive public shell with accessible navigation and polished footer
- [x] Add ambient terrain silhouettes, performant particles, mouse-following glow, and reduced-motion handling
- [x] Add routes for Home, Mods, Plugins, Resource Packs, Modpacks, Maps, Shaders, Datapacks, Search/Discover, Project Details, About/Help, Sign In, and Sign Up
- [x] Integrate server-side Modrinth discovery/search and project metadata retrieval
- [x] Render icons, categories, loaders, Minecraft versions, downloads, tags, screenshots, changelog, and official external links with attribution
- [x] Add map entries using permitted links or safe placeholders without copying protected imagery
- [x] Build project detail experience with downloads/external-link actions, screenshots, metadata, changelog, favorites, loading, error, and empty states
- [x] Showcase Elemental Mastery, BountySMP, RedFaceMC, and sample PvP content with explicit attribution and no ownership claims
- [x] Add creator profile surfaces
- [x] Add protected Creator Studio with draft metadata, category, version/loader, screenshots, changelog, and download-link fields
- [x] Wire sign-in/sign-out-ready navigation using the existing auth flow without fake server-side success states
- [x] Add backend-ready project and creator data models, procedures, and storage references
- [x] Keep secrets and third-party configuration server-side
- [x] Add SEO metadata, robots treatment, favicon/logo treatment, and deployment-friendly structure
- [x] Add Vitest coverage for new backend logic and auth-protected behavior
- [x] Run typecheck, tests, visual verification, and final accessibility/responsive review
- [x] Save one final checkpoint after all requested features are complete

## Verification follow-ups

- [x] Fetch and render real Modrinth changelog and release data on project details, with explicit loading, error, and not-found states
- [x] Implement screenshot input/upload flow in Creator Studio and persist storage keys
- [x] Add project and creator profile persistence models/procedures beyond creator drafts
- [x] Add durable favorite persistence for authenticated users
- [x] Add robots.txt and verify SEO asset coverage
- [x] Add Vitest coverage for discovery search/project procedures and authenticated draft persistence paths

## Bug fixes

- [x] Fix React missing-key warning in HomeContent list rendering and verify the homepage console is clean
