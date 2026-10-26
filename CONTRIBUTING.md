# Contributing to readbagabondo

Thank you for your interest in contributing to readbagabondo! We welcome all contributions and are excited to have you join our project.

## Project Overview

readbagabondo is a manga reader web application for Takehiko Inoue's masterpiece Vagabond. Built with Astro as a fully static site, it provides a minimalist, high-quality reading experience: metadata comes from a local SQLite database read at build time, and manga images are served from a CDN. A small, separate Cloudflare Worker (`mihon/`) exposes a read-only API for the Mihon/Keiyoushi extension.

This software is licensed under the MIT License, but this license does NOT grant any rights to manga content. Vagabond © Takehiko Inoue / Kodansha. This site is unofficial and provides content for personal reference only. All rights remain with the original creators and publishers.

## Current Development Priorities

### Major Feature Development

We're actively working on these high-impact features:

1. **Single Page Reader (Alternative Reading Mode)**
   - Canvas-based rendering with smooth page flip transitions
   - Thumbnail navigation sidebar/bottom panel
   - Reading progress indicator adapted for single-page navigation
   - Mobile gesture support implementation
   - Page preloading for smooth transitions

2. **Chapter Selection UI Improvements**
   - Manual chapter jump within the reader interface (navigation is currently sequential prev/next only)
   - Integration with volume/chapter data structure
   - Reading progress display for each chapter

### Mihon API

- **Status**: the Worker in `mihon/` was already rewritten from the ground up. Its routes live under `/api/mihon` and there is no versioned (v1/v2) endpoint — changes are made in place
- **Breaking Changes**: document contract changes in the PR and notify the Keiyoushi extension maintainers

## Getting Started

### Prerequisites

- Node.js 22.12+ (Astro 6 requirement)
- pnpm package manager
- Git
- Cloudflare account (optional — only needed to deploy the `mihon/` Worker)

### Setup for Contributors

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone <your-fork-url>
cd readbagabondo

# 3. Install dependencies
pnpm install

# 4. Configure and generate the local SQLite database
cp .env.example .env   # sets DATABASE_URL
pnpm db:migrate        # creates packages/db/local.db and applies migrations
sqlite3 packages/db/local.db < packages/db/seeds/0000_seed_vagabond_metadata.sql

# 5. Create a feature branch from main
git checkout main
git pull origin main
git checkout -b feat/your-feature-name
# Examples:
# git checkout -b feat/single-page-reader
# git checkout -b feat/dark-mode
# git checkout -b fix/reading-progress

# 6. Start development server
pnpm dev               # Local development server for the static reader
```

### Database Setup Details

The application reader is a fully static site (SSG) that reads metadata from a local SQLite database (`packages/db/local.db`) via Drizzle ORM and `@libsql/client`:

- **Database Package**: `@readbagabondo/db` in `packages/db/`
- **Database File**: `packages/db/local.db` (git-ignored; generate it with `pnpm db:migrate` plus the seed script)
- **Migrations**: `packages/db/drizzle/migrations/`
- **Seeds**: `packages/db/seeds/`

**Database Commands**:

```bash
# Generate migrations
pnpm db:generate

# Apply migrations to local.db
pnpm db:migrate

# Inspect database
pnpm db:studio
```

### Development Commands

```bash
pnpm dev               # Start Astro development server
pnpm build             # Build static site to dist/
pnpm preview           # Preview production build locally
```

### Mihon Worker Setup (Optional)

The reader needs no Cloudflare account. Only the `mihon/` Worker does:

```bash
cd mihon
pnpm dev            # wrangler dev — local Worker with D1 emulation
pnpm deploy         # wrangler deploy --minify
```

Authenticate first with `pnpm wrangler login` from inside `mihon/` (that is where `wrangler` is installed), then verify with `pnpm wrangler whoami`.

## Feature-Specific Implementation Guidelines

### Single Page Reader Implementation

**Current State**: Vertical cascade layout with continuous scrolling (default), plus an opt-in two-page spread view for desktop with an LTR/RTL toggle
**Target State**: Single page horizontal navigation as optional alternative mode

**Technical Requirements**:

- Use canvas for page rendering (not image elements)
- Implement page flip transitions between pages
- Add thumbnail navigation panel (sidebar or bottom)
- Show reading progress for single-page navigation
- Mobile: Implement swipe gestures for page navigation
- Performance: Preload next/previous pages for smooth transitions

**Files to Modify**:

- `src/pages/volume-[volume]/chapter-[chapter]/index.astro` (main reading interface)
- `src/feature/reader/` (reader state, spread pairing, direction/view-mode preferences)
- `src/styles/global.css` (spread layout and transition styles)

### Reader View Options

Three reader preferences already ship and are persisted in `localStorage`: theme (`ThemeToggle.astro`, `dark` class), view mode (`ViewToggle.astro`, `double` class) and reading direction (`DirectionToggle.astro`, `ltr` class). `src/styles/global.css` holds the spread layout rules, and `BaseLayout.astro` applies the stored preferences before first paint. Extend these instead of adding a parallel preference system.

### Comment System Implementation

**Current State**: No comment functionality
**Target State**: Per chapter and volume discussions

**Technical Requirements**:

- Design database schema for comments (users, comments, reactions)
- Create API routes for CRUD operations
- Build comment UI components using Tailwind/Flowbite
- Integrate with existing chapter/volume structure

**Files to Create/Modify**:

- `packages/db/drizzle/migrations/` (add comment tables via `pnpm db:generate`)
- `src/feature/comments/` (add comment functions)
- Page templates (add comment components)

### Chapter Selection UI Implementation

**Current State**: Users must go back to volume page to change chapters
**Target State**: Chapter selection within reading interface

**Technical Requirements**:

- Add chapter navigation dropdown/sidebar in reader
- Display reading progress per chapter
- Integrate with existing volume/chapter data structure

**Files to Modify**:

- `src/pages/volume-[volume]/chapter-[chapter]/index.astro` (add chapter selector)

### Mihon API Changes

**Current State**: `mihon/` is the rewritten Worker (Hono, D1 through `@readbagabondo/db`, base path `/api/mihon`, `q`/`page` support on `/mangas`). There is no planned v2 endpoint — the API evolves in place.

**Guidelines**:

- Keep the unversioned `/api/mihon` path; do not add a version segment
- Preserve the response shape the Keiyoushi extension consumes, or document the break and notify its maintainers
- Keep queries in `@readbagabondo/db` so the Worker and the static reader share them

**Note**: extend `mihon/src/index.ts` directly on a short-lived branch merged to `main`; there is no long-lived API branch.

## Branch Strategy & Submission Process

### Trunk-Based Development

This project uses **trunk-based development** with `main` as the primary development branch:

- `main`: Primary development trunk (deployment is manual and outside this repo)
- Feature branches: Short-lived, created from and merged directly to `main`
- No long-lived development branches

### Branch Structure

- `main`: Production trunk (all development happens here)
- `feat/*`: Feature branches (short-lived)
- `fix/*`: Bug fix branches (short-lived)
- `docs/*`: Documentation update branches

### Branch Naming Conventions

- Features: `feat/single-page-reader`, `feat/dark-mode`, `feat/comment-system`
- API work: `feat/mihon-pagination`, `fix/mihon-chapter-order` (the Worker is unversioned under `/api/mihon`; ship changes in place and notify Keiyoushi maintainers of breaks)
- **Breaking API changes**: document them in the PR description (see [Mihon API Changes](#mihon-api-changes))

### Hotfixes & Bug Resolution

**If a bug is discovered in production after merge**:

1. **Create hotfix branch from `main`**:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b fix/critical-bug-name
   ```

2. **Fix the issue** with minimal changes
3. **Open PR targeting `main`** with `[HOTFIX]` prefix in title
4. **Fast-track review** by maintainer
5. **Merge, then deploy** (deployment is manual)

**Forward-fix strategy**: We fix forward, not rollback. Publishing the static build is fast enough to patch issues quickly.

**For critical production outages**: A maintainer may re-publish the previous `dist/` build while the hotfix is prepared.

- Bug fixes: `fix/reading-progress`, `fix/navigation-issue`, `fix/cache-headers`
- API work: `feat/mihon-pagination`, `fix/mihon-chapter-order`
- Documentation: `docs/update-contributing`, `docs/api-migration-guide`

### Pull Request Workflow

1. **Fork the repository**
2. **Clone your fork locally**
3. **Create feature branch from `main`**:

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature-name
   ```

4. **Develop and test your changes locally**
5. **Push to your fork**: `git push origin feat/your-feature-name`
6. **Open pull request targeting `main` branch**
7. **CodeRabbit automatically reviews your PR**
8. **`pnpm build` check passes**
9. **Address review feedback**
10. **Maintainer approves PR** (after CodeRabbit review + passing build)
11. **Merge to `main`**

### Testing Your PR

**Local Testing** (required before opening PR):

```bash
pnpm dev                      # Test locally with Astro dev server
pnpm build && pnpm preview    # Test production build locally
cd mihon && pnpm dev          # Test the mihon Worker (wrangler dev)
```

**Testing Others' PRs** (for reviewers and contributors):

```bash
# Using GitHub CLI
gh pr checkout <pr-number>

# Or manually
git fetch origin pull/<pr-number>/head:pr-<pr-number>
git checkout pr-<pr-number>

# Then test locally
pnpm install
pnpm dev
```

### Merge Requirements

Before a PR can be merged to `main`:

1. **CodeRabbit review passed** (automated)
2. **`pnpm build` succeeds** (automated check)
3. **Maintainer approval** (manual)
4. **No merge conflicts with main**

**All checks must pass** - no manual override for failed builds.

### Merge Strategy

- **All work merges directly to `main`**
- **Deployment is manual and lives outside this repo**; merging to `main` does not publish the site
- **Short-lived feature branches** - merge within days, not weeks
- **Small, incremental PRs preferred** over large, long-lived branches

## Technical Guidelines

### Code Style & Standards

- Follow detailed guidelines in [AGENTS.md](./AGENTS.md)
- Use TypeScript strict mode
- Follow Astro static-site patterns: pages that take dynamic params export `getStaticPaths`
- Implement proper error handling and validation
- Use Tailwind utility classes, Flowbite components
- Mobile-first responsive design approach

### Database Operations

- Add new queries to `packages/db/src/queries.ts` and import them from `@readbagabondo/db`
- Use Drizzle's query builder (parameterized under the hood); never string-concatenate SQL
- Lookups return a single row or `undefined`; handle the empty case in the caller
- Prefer types inferred from the schema in `packages/db/src/schema.ts`
- The reader uses the local libsql client; the mihon Worker passes its D1 binding to `createDb`

### API Development

- In the reader, API routes are build-time files such as `src/pages/sitemap.xml.ts` exporting a `GET` of type `APIRoute`
- In the `mihon/` Worker, add handlers to the Hono app in `mihon/src/index.ts` (mounted under `/api/mihon`)
- Return proper HTTP status codes and descriptive error messages
- Validate `c.req.param()` / `c.req.query()` values before querying

### Security Best Practices

- Sanitize all user input and URL parameters
- Use parameterized queries for database operations
- Validate route parameters before processing
- Never expose sensitive data or API keys
- Implement proper CORS headers for API endpoints

## Commit Message Conventions

We follow **Conventional Commits** format to maintain consistency and enable automated changelog generation.

### Format

```
<type>: <description>
```

### Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code formatting/style changes (no functional changes)
- `refactor`: Code refactoring without functional changes
- `test`: Adding/updating tests
- `chore`: Maintenance tasks, dependency updates
- `perf`: Performance improvements

### Examples

- `feat: implement single page canvas rendering`
- `fix: resolve chapter data timeout issue`
- `docs: update setup instructions for local dev`
- `refactor: extract common database utilities`
- `style: adjust dark mode toggle positioning`
- `test: add unit tests for page navigation`
- `chore: update tailwind to v4.2.0`
- `perf: optimize image loading for large chapters`

## Pull Request Title Conventions

PR titles follow the same format as commit messages for consistency.

### Format

```
<type>: <description>
```

### Guidelines

- Keep titles under 72 characters
- Use present tense ("add" not "added")
- Include issue numbers when applicable
- Be specific about what the PR does

### Examples

- `feat: add LTR/RTL reading direction support`
- `fix: resolve chapter count calculation error`
- `docs: document the Mihon API query params`
- `refactor: extract common page layout components`
- `perf: improve image caching strategy`

## Pull Request Description Guidelines

Clear PR descriptions help reviewers understand your changes quickly. Use this template:

### Required Sections

```markdown
## Problem/Motivation

Brief description of what problem this change addresses and why it's needed.

## Implementation

How the change was implemented, including technical details and any important decisions made.

## Testing

How this was tested:

- Manual testing steps performed
- Devices/browsers checked
- Specific functionality verified

## Breaking Changes

List any breaking changes or note "None" if there are none.

## Related Issues

Closes #123, Related to #456, or "None"
```

### Examples by Contribution Type

**Feature Example:**

```markdown
## Problem/Motivation

Users currently need to navigate back to the volume page to switch chapters while reading. This PR adds chapter navigation directly in the reader interface.

## Implementation

Implemented chapter dropdown navigation in reader sidebar that:

- Fetches all chapters from current volume
- Maintains current reading position
- Updates URL for bookmarking
- Includes reading progress indicators

## Testing

- Tested chapter navigation in volume 4
- Verified dropdown works on mobile and desktop
- Confirmed reading position is preserved
- Checked bookmark functionality with new URLs

## Breaking Changes

None

## Related Issues

Closes #87
```

**Bug Fix Example:**

```markdown
## Problem/Motivation

Chapter pages were not loading correctly due to database timeout issue after 30 seconds.

## Implementation

- Added connection timeout handling in database queries
- Implemented retry mechanism for failed requests
- Added proper error messaging for users

## Testing

- Reproduced original timeout issue
- Verified fix works consistently
- Tested error handling scenarios
- Checked mobile and desktop compatibility

## Breaking Changes

None

## Related Issues

Closes #92
```

**API Development Example:**

```markdown
## Problem/Motivation

`GET /api/mihon/mangas` returned every manga in one response, so the Keiyoushi extension had no way to page through the catalogue.

## Implementation

- Added a `page` query param with a fixed page size of 20
- Added a `q` query param to filter by title
- Reused the existing query helper from `@readbagabondo/db`

## Testing

- Queried `/api/mihon/mangas?q=vagabond&page=1` locally with `pnpm dev`
- Verified the extension still parses the response
- Confirmed an unmatched filter returns `[]`

## Breaking Changes

None — both query params are optional

## Related Issues

Closes #<issue-number>
```

## Testing Approach

Currently, this project uses manual testing rather than automated tests:

1. **Local Testing**: Run `pnpm dev` and test all user flows
2. **API Testing**: Test the mihon endpoints directly (see `mihon/README.md`)
3. **Responsive Testing**: Verify functionality across devices
4. **Worker Testing**: Run `pnpm dev` inside `mihon/` for the API Worker

Before submitting a PR, please ensure:

- Your changes work as expected
- UI is responsive across different screen sizes
- API endpoints return correct responses
- No console errors or warnings

## Deployment Process

### Reader (static site)

- **Build**: `pnpm build` writes the fully static site to `dist/`
- **Prerequisite**: `packages/db/local.db` must exist (see setup above) and `DATABASE_URL` must be set
- **Deploy**: upload `dist/` to any static host or CDN. No deployment pipeline is configured in this repository.

### Mihon Worker

- **Deploy**: `cd mihon && pnpm deploy` (Cloudflare Workers, D1 binding `bagabondo_db`)

### Development Deployment Flow

1. **Development**: `pnpm dev` for local Astro development
2. **Worker Testing**: `cd mihon && pnpm dev` for the API Worker
3. **Production**: build locally, then publish `dist/` with your static host

## Community & Support

### Response Time Expectations

- PR reviews: Typically within 1-2 weeks
- Issue responses: Within 1 week for questions, sooner for bugs
- Feature requests: Will be evaluated against project roadmap

### Communication Channels

- GitHub Issues: Bug reports, feature requests, questions
- Pull Requests: Code contributions and reviews

### Security Disclosures

If you find a security vulnerability, do NOT open an issue. Please report it responsibly through appropriate channels.

## Important Disclaimers

### Licensing

- **Code**: Licensed under MIT License
- **Content**: No manga scans provided, respect copyright
- **Manga**: Vagabond © Takehiko Inoue / Kodansha

### Contribution Boundaries

- Code contributions are welcome and encouraged
- Do not submit manga scans or copyrighted content
- Respect licensing terms and copyright notices
- Focus on improving the reader application functionality

### Legal Notice

This site is unofficial and provides content for personal reference only. All rights remain with the original creators and publishers. Please support the official editions.

---

Thank you for contributing! Your help makes this project better for everyone interested in experiencing Takehiko Inoue's masterpiece.
