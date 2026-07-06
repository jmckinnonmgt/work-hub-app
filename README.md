# Work Hub

A personal task board. It is a static, browser-only app hosted on GitHub Pages that reads and writes a private GitHub Projects (v2) board directly from your browser, using a personal access token you paste in. The token is stored only in your browser (localStorage) and is never committed or sent anywhere else.

Live: https://jmckinnonmgt.github.io/work-hub-app/

## How it works

- Your tasks live in a separate private GitHub repo and its Projects v2 board. This repo holds only the interface.
- The UI is a dark kanban with drag-and-drop, a persistent quick-add, filters, and Board / Table / Learn / Meetings views.
- On first load it asks for a token; after that it goes straight to your board. Build and field names are loaded live from your project, so this public code contains none of them.

## Use it

1. Open the live URL above.
2. Paste a fine-grained personal access token with access to your task repo and its projects (Issues: read and write, Contents: read, Projects: read and write).
3. Your board loads. Use "Reset token" to clear the token from your browser.

## Develop

- `npm install`
- `npm run dev`, then open `http://localhost:3000/work-hub-app`
- `npm test` runs the unit tests.
- Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy-pages.yml`.
