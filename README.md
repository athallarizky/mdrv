# MD Review - Markdown Reviewer

A chill little web app for reviewing markdown files with inline comments. Drop in a document, click any line to add feedback, and export everything when you're done.

## What it does

- **Upload any .md file** and see it rendered beautifully
- **Click any line** to drop a comment — like Google Docs but for markdown
- **Side-by-side view** with source editor and live preview
- **Comment panel** to see all feedback in one place
- **Export comments** as a clean markdown file
- **Dark mode** for late-night review sessions
- **Works on mobile** — toggle between editor and preview views

## Tech stack

- React 19 + TypeScript
- Vite for the build
- Tailwind CSS v4 for styling
- Radix UI for components
- react-markdown for preview rendering

## Quick start

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## How to use

1. Open the app and hit "Upload File" (or drag & drop a .md file)
2. Click any line number in the editor to add a comment
3. Switch between Preview and Comments views in the right panel
4. Hit "Export" to download all comments as a markdown file

That's it. Happy reviewing!

---

Inspired by Google Antigravity's review implementation.
