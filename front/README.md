# Front Template - React Starter

Template frontend minimal `React` + `Vite` + `TypeScript` pour démarrer rapidement un projet et le brancher à une API (ex: le backend `back/` de ce repo).

## Inclus

- `React 19` + `Vite`
- `TypeScript` (mode strict)
- `React Router` (routeur de base)
- `Zustand` (store prêt à étendre)
- `ESLint` (configuré)
- `Vitest` (configuré, sans tests métier par défaut)
- `.env.example` avec `VITE_API_BASE_URL` (placeholder pour future intégration API)

## État actuel

- squelette volontairement minimal (pas d'UI métier fournie)
- `App` sert de layout racine et rend un `Outlet`
- route `*` à remplacer par une vraie page `404`

## Démarrage

1. Copier la config :
   - `cp .env.example .env`
2. Installer les dépendances :
   - `npm install`
3. Lancer en dev :
   - `npm run dev`

## Variables d'environnement

- `VITE_API_BASE_URL` : URL de base de l'API (exemple `http://localhost:1337/api`)

## Structure

- `src/main.tsx` : bootstrap React
- `src/App.tsx` : layout racine (rend `Outlet`)
- `src/router/index.tsx` : déclaration des routes
- `src/store/useAppStore.ts` : store global `Zustand` (vide par défaut)
- `src/index.css` : reset CSS minimal
- `src/test/setup.ts` : setup `Vitest`
