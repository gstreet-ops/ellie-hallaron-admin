# Ellie Hallaron Admin Panel

React-based CMS for managing the [Ellie Hallaron author website](https://gstreet-ops.github.io/ellie-hallaron-website/). Edits commit directly to the GitHub Pages site repo via the GitHub Contents API.

> This is a private admin tool, not a public-facing site.

## Sections

| Section | Data Source | Save Behavior |
|---------|------------|---------------|
| Books | `books.json` via GitHub API | Batched commit on Save |
| Bio | `bio.json` via GitHub API | Batched commit on Save |
| Social Links | `social.json` via GitHub API | Batched commit on Save |
| Site Settings | `site.json` + `hero.json` + `newsletter.json` via GitHub API | Batched commit on Save |
| Quiz Settings | `quiz.json` via GitHub API | Batched commit on Save |
| Quiz Questions | Supabase `community_questions` table | Immediate save to Supabase |

## How It Works

**Site Content** (Books, Bio, Social, Settings, Quiz Settings) is stored as JSON files in the website repo at `src/_data/`. The admin fetches these via the GitHub Contents API, presents editing forms, and commits changes back — triggering Eleventy to rebuild and deploy via GitHub Actions.

**Quiz Questions** are stored in Supabase and saved immediately on edit (no commit step needed).

## Stack

- React 18 (Vite)
- Supabase Auth + Database
- GitHub Contents API
- Magenta/cream/gold design system (matches the author website)

## Setup

1. Clone and install:
   ```
   git clone git@github.com:gstreet-ops/ellie-hallaron-admin.git
   cd ellie-hallaron-admin
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values:
   ```
   cp .env.example .env
   ```
   - `VITE_SUPABASE_URL` — Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — Supabase anon/public key
   - `VITE_GITHUB_TOKEN` — GitHub personal access token with `repo` scope for `gstreet-ops/ellie-hallaron-website`

3. Start dev server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```
